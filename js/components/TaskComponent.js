class TaskComponent {
  constructor(
    inputSelector,
    buttonSelector,
    containerSelector,
    storageService,
  ) {
    this.inputBox = document.querySelector(inputSelector);
    this.addButton = document.querySelector(buttonSelector);
    this.container = document.querySelector(containerSelector);
    this.storage = storageService;
    this.tasksByTag = {};
    this.currentTag = null;
    this.init();
  }

  init() {
    this.loadTasks();
    this.setupEventListeners();
  }

  loadTasks() {
    const saved = this.storage.get("tasks", {});
    this.tasksByTag = saved;
  }

  saveTasks() {
    this.storage.set("tasks", this.tasksByTag);
  }

  setCurrentTag(tagId) {
    this.currentTag = tagId;
    if (!this.tasksByTag[tagId]) {
      this.tasksByTag[tagId] = [];
    }
    this.renderTasks();
  }

  addTask(taskText = null) {
    const text = (taskText || this.inputBox.value).trim();

    if (!text) {
      alert("Please enter a task");
      return false;
    }

    if (!this.tasksByTag[this.currentTag]) {
      this.tasksByTag[this.currentTag] = [];
    }

    this.tasksByTag[this.currentTag].push({ text, checked: false });
    this.saveTasks();
    this.inputBox.value = "";
    this.renderTasks();

    return true;
  }

  deleteTask(taskText) {
    if (this.tasksByTag[this.currentTag]) {
      this.tasksByTag[this.currentTag] = this.tasksByTag[
        this.currentTag
      ].filter((t) => t.text !== taskText);
      this.saveTasks();
      this.renderTasks();
    }
  }

  renderTasks() {
    this.container.innerHTML = "";
    const tasks = this.tasksByTag[this.currentTag] || [];

    if (tasks.length === 0) {
      this.container.innerHTML =
        '<li id="no-task" style="text-align: center; color: var(--text-light); padding: 2rem;">No tasks yet</li>';
      return;
    }

    tasks.forEach((task) => {
      const li = this.createTaskElement(task);
      this.container.appendChild(li);
    });
  }

  createTaskElement(task) {
    const li = document.createElement("li");
    li.textContent = task.text;

    if (task.checked) {
      li.classList.add("checked");
    }

    const deleteSpan = document.createElement("span");
    deleteSpan.innerHTML = "\u00d7";
    deleteSpan.className = "task-delete";
    li.appendChild(deleteSpan);

    // Only attach toggle logic if this is NOT the #no-task placeholder
    if (li.id !== "no-task") {
      li.addEventListener("click", (e) => {
        if (e.target !== deleteSpan) {
          task.checked = !task.checked; // persist state
          li.classList.toggle("checked");
          this.saveTasks();
        }
      });

      deleteSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteTask(task.text);
      });
    }

    return li;
  }

  setupEventListeners() {
    if (this.addButton) {
      this.addButton.addEventListener("click", () => this.addTask());
    }

    this.inputBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask();
      }
    });
  }

  getTasks(tagId) {
    return this.tasksByTag[tagId] || [];
  }

  searchTasks(query) {
    const tasks = this.tasksByTag[this.currentTag] || [];
    return tasks.filter((task) =>
      task.text.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
