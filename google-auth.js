// Google API Integration for Task-Crusher
// Handles sign-in, sign-out, and saving/loading tasks to Google Drive
// --- SETUP INSTRUCTIONS ---
// 1. Go to https://console.cloud.google.com/
// 2. Create a project, enable Google Drive API and OAuth consent screen
// 3. Create OAuth 2.0 Client ID (Web), add your app's origin to Authorized JavaScript origins
// 4. Replace CLIENT_ID below with your own
// 5. Host this app on localhost or HTTPS for Google auth to work

const CLIENT_ID = ''; // <-- REPLACE THIS
const API_KEY = '';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile';

window.isGoogleSignedIn = false;
let googleUser = null;
let fileId = null; // Google Drive file ID for tasks

// Load Google API script
(function loadGapi() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = initClient;
    document.head.appendChild(script);
})();

function initClient() {
    window.gapi.load('client:auth2', async () => {
        await window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        });
        // Listen for sign-in state changes
        window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
    window.isGoogleSignedIn = isSignedIn;
    if (isSignedIn) {
        googleUser = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        onGoogleSignIn({
            name: googleUser.getName(),
            picture: googleUser.getImageUrl()
        });
    } else {
        googleUser = null;
        onGoogleSignOut();
    }
}

// Called by app.js
function signInGoogle() {
    window.gapi.auth2.getAuthInstance().signIn();
}
function signOutGoogle() {
    window.gapi.auth2.getAuthInstance().signOut();
}

// --- Google Drive: Save/Load Tasks --- //
// Save tasks as a single file (tasks.json) in appDataFolder
async function saveTasksToGoogle(tasks) {
    const content = JSON.stringify(tasks);
    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const close_delim = '\r\n--' + boundary + '--';
    const metadata = {
        name: 'tasks.json',
        mimeType: 'application/json',
        parents: ['appDataFolder']
    };
    // If fileId is known, update; else, create
    if (fileId) {
        await window.gapi.client.request({
            path: `/upload/drive/v3/files/${fileId}`,
            method: 'PATCH',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body:
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                content +
                close_delim
        });
    } else {
        const resp = await window.gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body:
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                content +
                close_delim
        });
        fileId = resp.result.id;
    }
}

// Load tasks from Google Drive
async function loadTasksFromGoogle() {
    // Find tasks.json in appDataFolder
    const resp = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name='tasks.json'"
    });
    if (resp.result.files && resp.result.files.length > 0) {
        fileId = resp.result.files[0].id;
        const file = await window.gapi.client.drive.files.get({
            fileId,
            alt: 'media'
        });
        window.tasks = JSON.parse(file.body);
    } else {
        window.tasks = [];
    }
    if (typeof renderTasks === 'function') renderTasks();
} 