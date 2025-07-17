# Task-Crusher

A modern, category-based to-do app with Google Drive sync and personalization.

## Features
- Add, categorize, filter, and edit tasks
- Change task category via dropdown
- Dark/light mode toggle
- Google Sign-In (profile pic, login/logout)
- Save/load tasks to Google Drive (appDataFolder)
- Responsive, modern UI

## Setup Instructions

### 1. Google API Setup
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Enable the **Google Drive API** and **OAuth consent screen**
- Create OAuth 2.0 Client ID (Web)
    - Add your app's origin (e.g., `http://localhost:8000`) to Authorized JavaScript origins
- Copy your Client ID and paste it in `google-auth.js` (`CLIENT_ID`)

### 2. Run Locally
- Place all files in a folder
- Start a local server (e.g., `python3 -m http.server` or use VSCode Live Server)
- Open `index.html` in your browser

## Usage
- Log in with Google (top right)
- Add tasks, select categories, filter, and mark complete
- Tasks are saved to your Google Drive (appDataFolder)
- Toggle dark/light mode (moon/sun icon)

---

**Note:**
- You must run the app on localhost or HTTPS for Google login to work.