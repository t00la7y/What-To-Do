// ==================== DOM ELEMENTS ====================
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const themeToggle = document.getElementById("theme-toggle");
const addTagButton = document.querySelector('.add-tag');
const tagList = document.querySelector('.list-type');
const menuItems = document.querySelectorAll('.menu-list li');
const searchInput = document.querySelector('#search-query input');

// ==================== STATE MANAGEMENT ====================
let currentSelectedTag = 'untitled';
const tasksByTag = {};
const STORAGE_KEY = 'tasksByTag';
const TAGS_STORAGE_KEY = 'customTags';
const DARK_MODE_KEY = 'darkMode';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadTasks();
  initializeTags();
  setupEventListeners();
  switchToTag('untitled');
});

// ==================== THEME MANAGEMENT ====================
function loadTheme() {
  const isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
  if (isDarkMode) {
    document.documentElement.classList.add('dark-mode');
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark-mode');
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  localStorage.setItem(DARK_MODE_KEY, isDarkMode);
}

// ==================== TAG MANAGEMENT ====================
function initializeTags() {
  const tags = document.querySelectorAll('.list-type .tag:not(.add-tag)');
  tags.forEach(tag => {
    if (!tasksByTag[tag.id]) {
      tasksByTag[tag.id] = [];
    }
    setupTagClickListener(tag);
  });
}

function setupTagClickListener(tag) {
  tag.addEventListener('click', () => {
    if (!tag.classList.contains('add-tag')) {
      switchToTag(tag.id);
    }
  });
}

function switchToTag(tagId) {
  // Update current selected tag
  currentSelectedTag = tagId;

  // Update visual state of tags
  document.querySelectorAll('.list-type .tag:not(.add-tag)').forEach(tag => {
    tag.classList.remove('tag-filter');
  });
  const selectedTag = document.getElementById(tagId);
  if (selectedTag) {
    selectedTag.classList.add('tag-filter');
  }

  // Update list container
  displayTasks(tagId);
}

function addNewTag() {
  const tagName = prompt("Enter new tag name:");
  if (tagName && tagName.trim()) {
    const tagId = 'tag-' + Date.now();
    const tagElement = document.createElement('span');
    tagElement.className = 'tag';
    tagElement.id = tagId;
    tagElement.textContent = tagName.trim();

    tasksByTag[tagId] = [];
    tagList.insertBefore(tagElement, addTagButton);
    setupTagClickListener(tagElement);
    saveTasks();
  }
}

// ==================== TASK MANAGEMENT ====================
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  if (savedTasks) {
    try {
      Object.assign(tasksByTag, JSON.parse(savedTasks));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByTag));
}

function addTask() {
  const taskText = inputBox.value.trim();

  if (taskText === '') {
    alert("Please write something");
    return;
  }

  // Add task to current tag
  if (!tasksByTag[currentSelectedTag]) {
    tasksByTag[currentSelectedTag] = [];
  }
  tasksByTag[currentSelectedTag].push(taskText);
  saveTasks();

  // Clear input and refresh display
  inputBox.value = '';
  displayTasks(currentSelectedTag);
}

function deleteTask(taskText) {
  if (tasksByTag[currentSelectedTag]) {
    tasksByTag[currentSelectedTag] = tasksByTag[currentSelectedTag].filter(t => t !== taskText);
    saveTasks();
    displayTasks(currentSelectedTag);
  }
}

function toggleTaskChecked(taskElement) {
  const taskText = taskElement.textContent.replace('\u00d7', '').trim();
  taskElement.classList.toggle('checked');
}

// ==================== DISPLAY & RENDERING ====================
function displayTasks(tagId) {
  listContainer.innerHTML = '';

  const tasks = tasksByTag[tagId] || [];

  if (tasks.length === 0) {
    listContainer.innerHTML = '<li style="text-align: center; color: var(--text-light); padding: 2rem;">No tasks yet. Add one to get started!</li>';
    return;
  }

  tasks.forEach(taskText => {
    const li = document.createElement('li');
    li.innerHTML = taskText;

    // Create delete button
    const deleteSpan = document.createElement('span');
    deleteSpan.innerHTML = '\u00d7';
    deleteSpan.className = 'task-delete';
    li.appendChild(deleteSpan);

    // Task click to toggle checked
    li.addEventListener('click', (e) => {
      if (e.target !== deleteSpan) {
        toggleTaskChecked(li);
      }
    });

    // Delete button click
    deleteSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(taskText);
    });

    listContainer.appendChild(li);
  });
}

function searchTasks(query) {
  if (!query.trim()) {
    displayTasks(currentSelectedTag);
    return;
  }

  const filteredTasks = (tasksByTag[currentSelectedTag] || []).filter(task =>
    task.toLowerCase().includes(query.toLowerCase())
  );

  listContainer.innerHTML = '';

  if (filteredTasks.length === 0) {
    listContainer.innerHTML = '<li style="text-align: center; color: var(--text-light); padding: 2rem;">No matching tasks found.</li>';
    return;
  }

  filteredTasks.forEach(taskText => {
    const li = document.createElement('li');
    li.innerHTML = taskText;

    const deleteSpan = document.createElement('span');
    deleteSpan.innerHTML = '\u00d7';
    deleteSpan.className = 'task-delete';
    li.appendChild(deleteSpan);

    li.addEventListener('click', (e) => {
      if (e.target !== deleteSpan) {
        toggleTaskChecked(li);
      }
    });

    deleteSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(taskText);
    });

    listContainer.appendChild(li);
  });
}

// ==================== MENU NAVIGATION ====================
function handleMenuClick(menuId) {
  switch (menuId) {
    case 'to-do-lists':
      // Show all tasks from current tag
      displayTasks(currentSelectedTag);
      break;
    case 'shared-List':
      // Show tasks from shared tag
      switchToTag('shared');
      break;
    case 'recently-Done':
      // Show completed/checked tasks
      displayCheckedTasks();
      break;
    case 'urgent-Task':
      // Show urgent tasks
      switchToTag('urgent');
      break;
    case 'settings':
      showSettings();
      break;
    case 'user':
      showUserProfile();
      break;
    default:
      break;
  }
}

function displayCheckedTasks() {
  listContainer.innerHTML = '';
  let hasCheckedTasks = false;

  Object.keys(tasksByTag).forEach(tagId => {
    (tasksByTag[tagId] || []).forEach(taskText => {
      const li = document.createElement('li');
      li.innerHTML = taskText;
      li.classList.add('checked');

      const deleteSpan = document.createElement('span');
      deleteSpan.innerHTML = '\u00d7';
      deleteSpan.className = 'task-delete';
      li.appendChild(deleteSpan);

      li.addEventListener('click', (e) => {
        if (e.target !== deleteSpan) {
          toggleTaskChecked(li);
        }
      });

      deleteSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(taskText);
      });

      listContainer.appendChild(li);
      hasCheckedTasks = true;
    });
  });

  if (!hasCheckedTasks) {
    listContainer.innerHTML = '<li style="text-align: center; color: var(--text-light); padding: 2rem;">No completed tasks yet.</li>';
  }
}

function showSettings() {
  alert('Settings feature coming soon!');
}

function showUserProfile() {
  alert('User Profile feature coming soon!');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Add task button
  const addButton = document.querySelector('button[aria-label="Add Task"]');
  if (addButton) {
    addButton.addEventListener('click', addTask);
  }

  // Add task on Enter key
  inputBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Add new tag button
  addTagButton.addEventListener('click', addNewTag);

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTasks(e.target.value);
    });
  }

  // Menu items
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      handleMenuClick(item.id);
    });
  });
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================
window.addTask = addTask;
window.deleteTask = deleteTask;
window.toggleTaskChecked = toggleTaskChecked;
window.switchToTag = switchToTag;
