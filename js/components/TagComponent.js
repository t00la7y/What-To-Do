class TagComponent {
  constructor(containerSelector, storageService) {
    this.container = document.querySelector(containerSelector);
    this.storage = storageService;
    this.tags = {};
    this.currentTag = null;
    this.onTagChange = null;
    this.init();
  }

  init() {
    this.loadTags();
    this.setupEventListeners();
    this.setupRemoveTagListeners();
  }

  loadTags() {
    const tagElements = this.container.querySelectorAll(".tag:not(.add-tag)");
    tagElements.forEach((tag) => {
      this.tags[tag.id] = { element: tag, name: tag.textContent };
      this.setupTagClickListener(tag);
    });
  }

  setupTagClickListener(tag) {
    tag.addEventListener("click", () => {
      this.selectTag(tag.id);
    });
  }

  selectTag(tagId) {
    if (this.tags[tagId]) {
      Object.keys(this.tags).forEach((id) => {
        this.tags[id].element.classList.remove("tag-filter");
      });

      this.tags[tagId].element.classList.add("tag-filter");
      this.currentTag = tagId;

      if (this.onTagChange) {
        this.onTagChange(tagId);
      }
    }
  }

  addTag(tagName) {
    if (!tagName || !tagName.trim()) return null;

    const tagId = "tag-" + Date.now();
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.id = tagId;
    tagElement.textContent = tagName.trim();

    this.tags[tagId] = { element: tagElement, name: tagName.trim() };

    const addTagButton = this.container.querySelector(".add-tag");
    this.container.insertBefore(tagElement, addTagButton);
    this.setupTagClickListener(tagElement);

    return tagId;
  }

  setupRemoveTagListeners() {
    document.querySelectorAll(".tag").forEach((tag) => {
      tag.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", tag.id);
        tag.classList.add("dragging");
      });
      tag.addEventListener("dragend", () => {
        tag.classList.remove("dragging");
      });
    });
    const deleteIcon = document.getElementById("tag-delete");
    deleteIcon.addEventListener("dragover", (e) => {
      e.preventDefault();
      deleteIcon.classList.add("drag-over");
    });
    deleteIcon.addEventListener("dragleave", () => {
      deleteIcon.classList.remove("drag-over");
    });
    deleteIcon.addEventListener("drop", (e) => {
      e.preventDefault();
      deleteIcon.classList.remove("drag-over");
      const tagId = e.dataTransfer.getData("text/plain");
      const tag = document.getElementById(tagId);
      if (tag) {
        tag.remove();
        const listContainer = document.getElementById("list-container");
        const relatedList = listContainer.querySelector(`#${tagId}-list`);
        if (relatedList) relatedList.remove();
        if (window.toast)
          window.toast.success(`Deleted tag "${tagId}" and its list`);
      }
    });
  }

  getAllTags() {
    return { ...this.tags };
  }

  getCurrentTag() {
    return this.currentTag;
  }

  setupEventListeners() {
    const addTagButton = this.container.querySelector(".add-tag");
    if (addTagButton) {
      addTagButton.addEventListener("click", () => {
        const tagName = prompt("Enter new tag name:");
        this.addTag(tagName);
      });
    }
  }
}
