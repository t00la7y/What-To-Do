class RecentlyDoneComponent {
  constructor(containerSelector, storageService) {
    this.container = document.querySelector(containerSelector);
    this.storage = storageService;
    this.recentlyDone = [];
    this.init();
  }

  init() {
    this.loadRecentlyDone();
    this.renderRecentlyDone();
  }

  loadRecentlyDone() {
    const tasks = this.storage.get("tasks", {});
    this.recentlyDone = [];

    // Collect all checked tasks from all tags
    Object.keys(tasks).forEach((tagId) => {
      const tagTasks = tasks[tagId] || [];
      tagTasks.forEach((task) => {
        if (task.checked) {
          this.recentlyDone.push({
            ...task,
            tagId: tagId,
            completedTime: task.completedTime || new Date().toISOString(),
          });
        }
      });
    });

    // Sort by completed time (newest first)
    this.recentlyDone.sort((a, b) => 
      new Date(b.completedTime) - new Date(a.completedTime)
    );
  }

  renderRecentlyDone() {
    if (!this.container) return;

    this.container.innerHTML = "";

    if (this.recentlyDone.length === 0) {
      this.container.innerHTML =
        '<li id="no-task" style="text-align: center; color: var(--text-light); padding: 2rem;">No completed tasks yet</li>';
      return;
    }

    this.recentlyDone.forEach((task) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.flexDirection = "column";
      li.style.padding = "1rem";
      li.style.borderBottom = "1px solid var(--gray-hover)";
      
      const taskText = document.createElement("span");
      taskText.textContent = task.text;
      taskText.style.color = "var(--text)";
      taskText.style.marginBottom = "0.5rem";

      const tagLabel = document.createElement("span");
      tagLabel.textContent = `Tag: ${task.tagId}`;
      tagLabel.style.fontSize = "0.8rem";
      tagLabel.style.color = "var(--text-light)";
      tagLabel.style.marginBottom = "0.5rem";

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "1rem";

      const unmarkBtn = document.createElement("button");
      unmarkBtn.textContent = "Mark as Incomplete";
      unmarkBtn.style.padding = "0.5rem 1rem";
      unmarkBtn.style.backgroundColor = "var(--accent)";
      unmarkBtn.style.color = "var(--primary-bg)";
      unmarkBtn.style.border = "none";
      unmarkBtn.style.borderRadius = "0.5rem";
      unmarkBtn.style.cursor = "pointer";

      unmarkBtn.addEventListener("click", () => {
        this.unmarkTask(task);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.padding = "0.5rem 1rem";
      deleteBtn.style.backgroundColor = "var(--gray-hover)";
      deleteBtn.style.color = "var(--text)";
      deleteBtn.style.border = "none";
      deleteBtn.style.borderRadius = "0.5rem";
      deleteBtn.style.cursor = "pointer";

      deleteBtn.addEventListener("click", () => {
        this.deleteTask(task);
      });

      actions.appendChild(unmarkBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(taskText);
      li.appendChild(tagLabel);
      li.appendChild(actions);

      this.container.appendChild(li);
    });
  }

  unmarkTask(task) {
    const tasks = this.storage.get("tasks", {});
    if (tasks[task.tagId]) {
      const taskIndex = tasks[task.tagId].findIndex(t => t.text === task.text);
      if (taskIndex !== -1) {
        tasks[task.tagId][taskIndex].checked = false;
        this.storage.set("tasks", tasks);
        this.loadRecentlyDone();
        this.renderRecentlyDone();
        if (window.toast) toast.info("Task marked as incomplete");
      }
    }
  }

  deleteTask(task) {
    const tasks = this.storage.get("tasks", {});
    if (tasks[task.tagId]) {
      tasks[task.tagId] = tasks[task.tagId].filter(t => t.text !== task.text);
      this.storage.set("tasks", tasks);
      this.loadRecentlyDone();
      this.renderRecentlyDone();
      if (window.toast) toast.success("Task deleted");
    }
  }
}
