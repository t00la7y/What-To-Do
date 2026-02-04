class Application {
  constructor() {
    this.storage = null;
    this.theme = null;
    this.tags = null;
    this.tasks = null;
    this.toast = null;
    this.recentlyDone = null;
    this.allLists = null;
    this.inbox = null;
    this.tagModal = null;
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

        this.recentlyDone = new RecentlyDoneComponent("#recently-done-list", this.storage);
        this.allLists = new AllListsComponent("#all-tasks-list", this.storage);
        this.inbox = new InboxComponent("#invitations-list", this.storage);
        this.tagModal = new TagModalComponent(this.storage);

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
        '<li id="no-task" style="text-align: center; color: var(--text-light); padding: 2rem;">No matching tasks found</li>';
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
        showPage("page-home");
        break;
      case "inbox":
        this.inbox.refresh();
        showPage("page-inbox");
        break;
      case "shared-List":
        showPage("page-shared-List");
        break;
      case "all-lists":
        this.allLists.refresh();
        showPage("page-all-lists");
        break;
      case "recently-Done":
        this.recentlyDone.loadRecentlyDone();
        this.recentlyDone.renderRecentlyDone();
        showPage("page-recently-done");
        break;
      case "userProfile":
        showPage("page-userProfile");
        break;
      case "settings":
        showPage("page-setting");
        break;
      default:
        break;
    }
  }

  loadInitialState() {
    this.tags.selectTag("untitled");
    showPage("page-home");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new Application();
});
