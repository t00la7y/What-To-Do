const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const tags = document.querySelectorAll('.list-type .tag');
const themeToggle = document.getElementById("theme-toggle");

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
});

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
    saveData();
}

// to do list
listContainer.addEventListener("click",function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
        saveData();
    } else if( e.target.tagName === "SPAN" ) {
        e.target.parentElement.remove();
        saveData();
    }
}, false)

// storage of list
function saveData() {
    localStorage.setItem('data', listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem('data');
}

showTask();

inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});


// tag cloud
tags.forEach(tag => {
  tag.addEventListener('click', () => {
    if (tag.classList.contains('tag-filter')) {
      // Deselect if already selected
      tag.classList.remove('tag-filter');
    } else {
      // Select this tag and deselect others
      tags.forEach(t => t.classList.remove('tag-filter'));
      tag.classList.add('tag-filter');
    }
    console.log("Active tag:", tag.textContent.trim());
  });
});
