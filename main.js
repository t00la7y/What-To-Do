const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const tags = document.querySelectorAll('.list-type .tag');
const themeToggle = document.getElementById("theme-toggle");
const addTabTag = document.querySelector('.add-tag');
const tabList = document.getElementById('tab-header-list');

// Track current selected tag
let currentSelectedTag = 'untitled';

// Data structure to store tasks by tag
const tasksByTag = {};

// local storage functions  
function saveData(elementToSave, key) {
  localStorage.setItem(key, elementToSave.innerHTML);
}

function showTags() {
  const tagContainer = document.querySelector('.list-type');
  const savedTags = localStorage.getItem('tagsData');
  if (savedTags) {
    const addButton = tagContainer.querySelector('.add-tag');
    tagContainer.innerHTML = savedTags;
    if (!tagContainer.querySelector('.add-tag')) {
      const newAddButton = document.createElement('span');
      newAddButton.className = 'add-tag';
      newAddButton.innerHTML = '+';
      tagContainer.appendChild(newAddButton);
      document.querySelector('.add-tag').addEventListener('click', handleAddTag);
    }
    document.querySelectorAll('.list-type .tag').forEach(tag => {
      setupTagClickListener(tag);
    });
  }
}

// Function to create a tab header
function createTabHeader(tagId, tagName) {
  const li = document.createElement('li');
  li.className = 'tab';
  li.setAttribute('data-tab', tagId);
  li.textContent = tagName;
  
  const span = document.createElement('span');
  span.innerHTML = '\u00d7';
  span.className = 'tab-close';
  li.appendChild(span);
  
  tabList.appendChild(li);
  
  li.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-close')) {
      switchTab(tagId);
    }
  });
  
  span.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTab(tagId);
  });
}

// Function to switch tabs
function switchTab(tagId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active-tab'));
  document.querySelector(`[data-tab="${tagId}"]`)?.classList.add('active-tab');
  
  // Update tag filter to match active tab
  document.querySelectorAll('.list-type .tag').forEach(tag => tag.classList.remove('tag-filter'));
  const correspondingTag = document.querySelector(`#${tagId}`);
  if (correspondingTag) {
    correspondingTag.classList.add('tag-filter');
  }
  
  currentSelectedTag = tagId;
  updateListContainer(tagId);
  reattachListeners();
}

// Function to delete a tab
function deleteTab(tagId) {
  if (tasksByTag[tagId]) {
    delete tasksByTag[tagId];
  }
  document.querySelector(`[data-tab="${tagId}"]`)?.remove();
  localStorage.setItem('tasksByTag', JSON.stringify(tasksByTag));
}

// Function to update list container based on active tag
function updateListContainer(tagId) {
  listContainer.innerHTML = '';
  
  if (tasksByTag[tagId] && tasksByTag[tagId].length > 0) {
    tasksByTag[tagId].forEach(taskHTML => {
      const li = document.createElement('li');
      li.innerHTML = taskHTML;
      const span = document.createElement('span');
      span.innerHTML = '\u00d7';
      span.className = 'task-delete';
      li.appendChild(span);
      listContainer.appendChild(li);
    });
  }
}

// Function to reattach listeners to list items
function reattachListeners() {
  listContainer.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function(e) {
      if (e.target.tagName === 'LI') {
        e.target.classList.toggle('checked');
      }
    });
    
    const span = li.querySelector('.task-delete');
    if (span) {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        const taskText = li.textContent.replace('\u00d7', '').trim();
        if (tasksByTag[currentSelectedTag]) {
          tasksByTag[currentSelectedTag] = tasksByTag[currentSelectedTag].filter(t => t !== taskText);
          localStorage.setItem('tasksByTag', JSON.stringify(tasksByTag));
        }
        li.remove();
      });
    }
  });
}

// input box
function addTask(){
    if( inputBox.value.trim() === ''){
        alert("Please write something");
        return;
    }
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    span.className = "task-delete";
    li.appendChild(span);
    
    // Store task in the current selected tag
    if (!tasksByTag[currentSelectedTag]) {
      tasksByTag[currentSelectedTag] = [];
    }
    tasksByTag[currentSelectedTag].push(inputBox.value);
    localStorage.setItem('tasksByTag', JSON.stringify(tasksByTag));
    inputBox.value = '';
}

// to do list - EVENT LISTENERS
listContainer.addEventListener("click", function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
    } else if( e.target.tagName === "SPAN" ) {
        const taskText = e.target.parentElement.textContent.replace('\u00d7', '').trim();
        if (tasksByTag[currentSelectedTag]) {
          tasksByTag[currentSelectedTag] = tasksByTag[currentSelectedTag].filter(t => t !== taskText);
          localStorage.setItem('tasksByTag', JSON.stringify(tasksByTag));
        }
        e.target.parentElement.remove();
    }
});

// tag cloud - FUNCTION DEFINITIONS
function setupTagClickListener(tag) {
  tag.addEventListener('click', () => {
    const tagId = tag.id || tag.textContent.trim();
    
    if (tag.classList.contains('tag-filter')) {
      tag.classList.remove('tag-filter');
    } else {
      document.querySelectorAll('.list-type .tag').forEach(t => t.classList.remove('tag-filter'));
      tag.classList.add('tag-filter');
      
      if (!document.querySelector(`[data-tab="${tagId}"]`)) {
        createTabHeader(tagId, tag.textContent.trim());
      }
      
      switchTab(tagId);
    }
  });
}

function handleAddTag() {
  const newTag = prompt("Enter new tag name:");
  if (newTag) {
    const tagElement = document.createElement('div');
    tagElement.classList.add('tag');
    tagElement.textContent = newTag;
    const tagId = 'tag-' + Date.now();
    tagElement.id = tagId;
    document.querySelector('.list-type').insertBefore(tagElement, addTabTag);
    setupTagClickListener(tagElement);
    saveData(document.querySelector('.list-type'), 'tagsData');
  }
}

// GLOBAL EVENT LISTENERS
inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
});

// INITIALIZATION
showTags();

const savedTasks = localStorage.getItem('tasksByTag');
if (savedTasks) {
  Object.assign(tasksByTag, JSON.parse(savedTasks));
}

tags.forEach(tag => {
  if (!tag.id) {
    tag.id = 'tag-' + tag.textContent.trim().toLowerCase().replace(/\s+/g, '-');
  }
  setupTagClickListener(tag);
  if (!tasksByTag[tag.id]) {
    tasksByTag[tag.id] = [];
  }
});

if (!document.querySelector('[data-tab="untitled"]')) {
  createTabHeader('untitled', 'Untitled');
}
switchTab('untitled');

addTabTag.addEventListener('click', handleAddTag);