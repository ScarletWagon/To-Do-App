// TaskMaster App Logic
// Handles theme, tasks, categories, UI, and Google API integration

// ========== Theme Toggle ========== //
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

/**
 * Set the theme (light or dark) and update the theme icon.
 * @param {string} mode - 'light' or 'dark'
 */
function setTheme(mode) {
    if (mode === 'light') {
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        // Switch to sun icon
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.setAttribute('data-feather', 'sun');
            if (window.feather) window.feather.replace();
        }
    } else {
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
        // Switch to moon icon
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.setAttribute('data-feather', 'moon');
            if (window.feather) window.feather.replace();
        }
    }
}

// Initialize theme on load
setTheme(localStorage.getItem('theme') || 'dark');
themeToggle.addEventListener('click', () => {
    setTheme(body.classList.contains('light-mode') ? 'dark' : 'light');
});

// ========== Category Data & State ========== //
let categories = ['Work', 'Personal', 'Shopping'];
let currentCategory = 'All';
let openDropdownTaskIdx = null;

// ========== DOM Elements ========== //
const categoriesSection = document.querySelector('.categories-section');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// ========== Category Functions ========== //
/**
 * Render the category filter buttons and add category button.
 */
function renderCategories() {
    categoriesSection.innerHTML = '<span>Categories:</span>';
    // All button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-filter';
    allBtn.dataset.category = 'All';
    allBtn.textContent = 'All';
    if (currentCategory === 'All') allBtn.classList.add('active');
    allBtn.onclick = () => setCategory('All');
    categoriesSection.appendChild(allBtn);
    // Category buttons
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-filter';
        btn.dataset.category = cat;
        btn.textContent = cat;
        if (currentCategory === cat) btn.classList.add('active');
        // Remove icon
        const remove = document.createElement('span');
        remove.className = 'remove-category';
        remove.textContent = '−';
        remove.title = 'Remove category';
        remove.onclick = (e) => {
            e.stopPropagation();
            removeCategory(cat);
        };
        btn.appendChild(remove);
        btn.onmouseenter = () => btn.classList.add('show-remove');
        btn.onmouseleave = () => btn.classList.remove('show-remove');
        btn.onclick = (e) => {
            if (e.target === remove) return;
            setCategory(cat);
        };
        categoriesSection.appendChild(btn);
    });
    // Add (+) button
    const addBtn = document.createElement('button');
    addBtn.className = 'category-add';
    addBtn.title = 'Add category';
    addBtn.textContent = '+';
    addBtn.onclick = () => {
        const name = prompt('Enter new category name:');
        if (name && !categories.includes(name) && name !== 'All') {
            categories.push(name);
            saveCategories();
            renderCategories();
            renderTasks();
        }
    };
    categoriesSection.appendChild(addBtn);
    updateCategorySelect();
}

/**
 * Set the current category and re-render UI.
 * @param {string} cat
 */
function setCategory(cat) {
    currentCategory = cat;
    renderCategories();
    renderTasks();
}

/**
 * Remove a category and move its tasks to 'Uncategorized'.
 * @param {string} cat
 */
function removeCategory(cat) {
    if (!categories.includes(cat)) return;
    tasks.forEach(t => {
        if (t.category === cat) t.category = 'Uncategorized';
    });
    categories = categories.filter(c => c !== cat);
    saveCategories();
    renderCategories();
    renderTasks();
}

/**
 * Save categories to localStorage.
 */
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

/**
 * Load categories from localStorage.
 */
function loadCategories() {
    const local = localStorage.getItem('categories');
    if (local) categories = JSON.parse(local);
}

// ========== Task Data & State ========== //
let tasks = [];

// ========== Task Functions ========== //
/**
 * Render the list of tasks, including category dropdown and remove button.
 */
function renderTasks() {
    taskList.innerHTML = '';
    let filtered = (currentCategory === 'All') ? tasks : tasks.filter(t => t.category === currentCategory);
    if (filtered.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'task-item';
        empty.style.opacity = 0.6;
        empty.textContent = 'No tasks in this category.';
        taskList.appendChild(empty);
        return;
    }
    filtered.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        li.onmouseenter = () => li.classList.add('hovered');
        li.onmouseleave = () => li.classList.remove('hovered');

        // Checkbox for completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });
        li.appendChild(checkbox);

        // Task title
        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;
        li.appendChild(title);

        // Category dropdown (pop-down menu)
        const catBtn = document.createElement('div');
        catBtn.className = 'task-category';
        catBtn.tabIndex = 0;
        catBtn.innerHTML = `<span>${task.category}</span> <i data-feather="chevron-down" class="cat-chevron"></i>`;
        catBtn.onclick = (e) => {
            e.stopPropagation();
            if (openDropdownTaskIdx === idx) {
                openDropdownTaskIdx = null;
                renderTasks();
                return;
            }
            openDropdownTaskIdx = idx;
            renderTasks();
        };
        if (openDropdownTaskIdx === idx) {
            const dropdown = document.createElement('div');
            dropdown.className = 'category-dropdown open';
            categories.forEach(cat => {
                if (cat !== task.category) {
                    const btn = document.createElement('button');
                    btn.textContent = cat;
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        task.category = cat;
                        openDropdownTaskIdx = null;
                        saveTasks();
                        renderTasks();
                    };
                    dropdown.appendChild(btn);
                }
            });
            catBtn.appendChild(dropdown);
        }
        li.appendChild(catBtn);

        // Minus icon for delete (shows on hover)
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-task-btn';
        removeBtn.innerHTML = '<i data-feather="minus-circle"></i>';
        removeBtn.title = 'Remove task';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Delete this task?')) {
                tasks.splice(tasks.indexOf(task), 1);
                saveTasks();
                renderTasks();
            }
        };
        li.appendChild(removeBtn);

        taskList.appendChild(li);
    });
    // Render Feather icons after DOM update
    if (window.feather) window.feather.replace();
    // Close dropdown on outside click
    document.onclick = (e) => {
        if (openDropdownTaskIdx !== null) {
            openDropdownTaskIdx = null;
            renderTasks();
        }
    };
}

/**
 * Add a new task from the input field and selected category.
 */
function addTask() {
    const title = taskInput.value.trim();
    const select = document.getElementById('category-select');
    const category = select ? select.value : (categories[0] || 'Uncategorized');
    if (!title) return;
    tasks.push({ title, category, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
}
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
});

// ========== Google API Integration ========== //
// The following functions are called by google-auth.js for Google login/logout and Drive sync.
/**
 * Called after Google login. Updates profile area and loads tasks from Google Drive.
 */
function onGoogleSignIn(user) {
    document.getElementById('profile-area').innerHTML = `
        <img id="profile-pic" src="${user.picture}" alt="Profile">
        <span>${user.name}</span>
        <button id="logout-btn">Logout</button>
    `;
    document.getElementById('logout-btn').onclick = signOutGoogle;
    loadTasksFromGoogle();
}

/**
 * Called after Google logout. Resets profile area and clears tasks.
 */
function onGoogleSignOut() {
    document.getElementById('profile-area').innerHTML = `
        <button id="login-btn">Login with Google</button>
    `;
    document.getElementById('login-btn').onclick = signInGoogle;
    tasks = [];
    renderTasks();
}

/**
 * Save tasks to Google Drive or localStorage.
 */
function saveTasks() {
    if (window.isGoogleSignedIn) {
        saveTasksToGoogle(tasks);
    } else {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

/**
 * Load tasks from Google Drive or localStorage.
 */
function loadTasks() {
    if (window.isGoogleSignedIn) {
        loadTasksFromGoogle();
    } else {
        const local = localStorage.getItem('tasks');
        tasks = local ? JSON.parse(local) : [];
        renderTasks();
    }
}

/**
 * Update the category select dropdown in the add task section.
 */
function updateCategorySelect() {
    const select = document.getElementById('category-select');
    if (!select) return;
    select.innerHTML = '';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
    // Always have Uncategorized
    if (!categories.includes('Uncategorized')) {
        const opt = document.createElement('option');
        opt.value = 'Uncategorized';
        opt.textContent = 'Uncategorized';
        select.appendChild(opt);
    }
}

// ========== App Initialization ========== //
window.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    renderCategories();
    updateCategorySelect();
    if (!window.isGoogleSignedIn) onGoogleSignOut();
    loadTasks();
    if (window.feather) window.feather.replace();
}); 