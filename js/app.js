class Application {
  constructor() {
    this.storage = null;
    this.theme = null;
    this.tags = null;
    this.tasks = null;
    this.toast = null;
    this.init();
  }

  async init() {
    try {
      this.storage = new StorageService("wtd_");

      this.theme = new ThemeService(this.storage);

      this.tags = new TagComponent(".list-type", this.storage);

      this.tasks = new TaskComponent(
        "#input-box",
        'button[aria-label="Add Task"]',
        "#list-container",
        this.storage,
      );

      this.toast = toast;

      this.setupComponentBindings();

      this.setupUIListeners();

      this.loadInitialState();

      //   this.toast.success('App initialized successfully!');
    } catch (error) {
      console.error("Initialization error:", error);
      if (this.toast) {
        this.toast.error("Failed to initialize app");
      }
    }
  }

  setupComponentBindings() {
    this.tags.onTagChange = (tagId) => {
      this.tasks.setCurrentTag(tagId);
      //   this.toast.info(`Switched to ${this.tags.tags[tagId].name}`);
    };
  }

  setupUIListeners() {

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.theme.toggle();
      });
    }

    const searchInput = document.querySelector("#search-query input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.handleSearch(e.target.value);
      });
    }
    const menuItems = document.querySelectorAll(".menu-list li");
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.handleMenuClick(item.id);
      });
    });
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.tasks.renderTasks();
      return;
    }

    const results = this.tasks.searchTasks(query);
    this.tasks.container.innerHTML = "";

    if (results.length === 0) {
      this.tasks.container.innerHTML =
        '<li style="text-align: center; color: var(--text-light); padding: 2rem;">No matching tasks found</li>';
      return;
    }

    results.forEach((taskText) => {
      const li = this.tasks.createTaskElement(taskText);
      this.tasks.container.appendChild(li);
    });
  }

  handleMenuClick(menuId) {
    switch (menuId) {
      case "home":
        this.tags.selectTag("untitled");
        addEventListener("click", () => { 
          showPage("page-home");})
        break;
      case "shared-List":
        this.tags.selectTag("shared");
        addEventListener("click", () => {
          showPage("page-home");
        });
        break;
      case "recently-Done":
        this.tags.selectTag("recent");
        addEventListener("click", () => {
          showPage("page-home");
        });
        break;
      case "urgent-Task":
        this.tags.selectTag("urgent");
        addEventListener("click", () => {
          showPage("page-home");
        });
        break;
      case "settings":
        addEventListener("click", () => {
          showPage("page-setting");
        });
        break;
      case "user":
        this.tags.selectTag("user");
        addEventListener("click", () => {
          showPage("page-user").style.width = "80%";
        });
        break;
    }
  }

  loadInitialState() {
    const firstTag = Object.keys(this.tags.tags)[0];
    if (firstTag) {
      this.tags.selectTag(firstTag);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new Application();
});
