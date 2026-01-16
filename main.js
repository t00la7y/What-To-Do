const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const tags = document.querySelectorAll('.list-type .tag');
const themeToggle = document.getElementById("theme-toggle");
const addTabTag = document.querySelector('.add-tag');

function saveData(elementToSave, key) {
  localStorage.setItem(key, elementToSave.innerHTML);
}

function showData(containerId, key) {
  const container = document.getElementById(containerId);
  const savedData = localStorage.getItem(key);
  if (savedData) {
    container.innerHTML = savedData;
  }
}

function showTags() {
  const tagContainer = document.querySelector('.list-type');
  const savedTags = localStorage.getItem('tagsData');
  if (savedTags) {
    // Find where the add button is
    const addButton = tagContainer.querySelector('.add-tag');
    tagContainer.innerHTML = savedTags;
    // Re-add the add-tag button at the end if it was removed
    if (!tagContainer.querySelector('.add-tag')) {
      const newAddButton = document.createElement('span');
      newAddButton.className = 'add-tag';
      newAddButton.innerHTML = '+';
      tagContainer.appendChild(newAddButton);
      document.querySelector('.add-tag').addEventListener('click', handleAddTag);
    }
    // Re-setup click listeners for all tags
    document.querySelectorAll('.list-type .tag').forEach(tag => {
      setupTagClickListener(tag);
    });
  }
}

// input box
function addTask(){
    if( inputBox.value.trim() === ''){
        alert("Please write something");
        return;
    }else{
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
    }
    inputBox.value = '';
    saveData(listContainer, 'listData');
}

// to do list
listContainer.addEventListener("click",function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
        saveData(listContainer, 'listData');
    } else if( e.target.tagName === "SPAN" ) {
        e.target.parentElement.remove();
        saveData(listContainer, 'listData');
    }
}, false)

// storage of list
showData('list-container', 'listData');
showTags();

inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
});

// tag cloud
function setupTagClickListener(tag) {
  tag.addEventListener('click', () => {
    if (tag.classList.contains('tag-filter')) {
      tag.classList.remove('tag-filter');
    } else {
      document.querySelectorAll('.list-type .tag').forEach(t => t.classList.remove('tag-filter'));
      tag.classList.add('tag-filter');
    }
    console.log("Active tag:", tag.textContent.trim());
  });
}

function handleAddTag() {
  const newTag = prompt("Enter new tag name:");
  if (newTag) {
    const tagElement = document.createElement('div');
    tagElement.classList.add('tag');
    tagElement.textContent = newTag;
    document.querySelector('.list-type').insertBefore(tagElement, addTabTag);
    setupTagClickListener(tagElement);
    saveData(document.querySelector('.list-type'), 'tagsData');
  }
}

tags.forEach(tag => {
  setupTagClickListener(tag);
});

addTabTag.addEventListener('click', handleAddTag);
