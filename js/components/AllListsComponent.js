class AllListsComponent {
  constructor(containerSelector, storageService) {
    this.container = document.querySelector(containerSelector);
    this.storage = storageService;
    this.allTasks = [];
    this.init();
  }

  init() {
    this.loadAllTasks();
  }

  loadAllTasks() {
    const tasks = this.storage.get("tasks", {});
    this.allTasks = [];

    // Collect all tasks from all tags
    Object.keys(tasks).forEach((tagId) => {
      const tagTasks = tasks[tagId] || [];
      tagTasks.forEach((task) => {
        this.allTasks.push({
          ...task,
          tagId: tagId,
        });
      });
    });
  }

  renderAllTasks() {
    if (!this.container) return;

    this.container.innerHTML = "";

    if (this.allTasks.length === 0) {
      this.container.innerHTML =
        '<li id="no-task" style="text-align: center; color: var(--text-light); padding: 2rem;">No tasks in any list</li>';
      return;
    }

    this.allTasks.forEach((task) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.padding = "1rem";
      li.style.borderBottom = "1px solid var(--gray-hover)";
      li.style.gap = "1rem";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.checked;
      checkbox.style.cursor = "pointer";
      checkbox.style.width = "1.25rem";
      checkbox.style.height = "1.25rem";

      checkbox.addEventListener("change", () => {
        this.toggleTask(task);
      });

      const taskContent = document.createElement("div");
      taskContent.style.flex = "1";

      const taskText = document.createElement("span");
      taskText.textContent = task.text;
      taskText.style.color = "var(--text)";
      if (task.checked) {
        taskText.style.textDecoration = "line-through";
        taskText.style.color = "var(--text-light)";
      }

      const tagLabel = document.createElement("span");
      tagLabel.textContent = `[${task.tagId}]`;
      tagLabel.style.fontSize = "0.8rem";
      tagLabel.style.color = "var(--accent)";
      tagLabel.style.marginLeft = "1rem";

      taskContent.appendChild(taskText);
      taskContent.appendChild(tagLabel);

      li.appendChild(checkbox);
      li.appendChild(taskContent);

      this.container.appendChild(li);
    });
  }

  toggleTask(task) {
    const tasks = this.storage.get("tasks", {});
    if (tasks[task.tagId]) {
      const taskIndex = tasks[task.tagId].findIndex(t => t.text === task.text);
      if (taskIndex !== -1) {
        tasks[task.tagId][taskIndex].checked = !tasks[task.tagId][taskIndex].checked;
        this.storage.set("tasks", tasks);
        this.loadAllTasks();
        this.renderAllTasks();
      }
    }
  }

  refresh() {
    this.loadAllTasks();
    this.renderAllTasks();
  }
}
