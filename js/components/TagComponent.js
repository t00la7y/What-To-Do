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
  }

  loadTags() {
    const tagElements = this.container.querySelectorAll('.tag:not(.add-tag)');
    tagElements.forEach(tag => {
      this.tags[tag.id] = { element: tag, name: tag.textContent };
      this.setupTagClickListener(tag);
    });
  }

  setupTagClickListener(tag) {
    tag.addEventListener('click', () => {
      this.selectTag(tag.id);
    });
  }

  selectTag(tagId) {
    if (this.tags[tagId]) {
      Object.keys(this.tags).forEach(id => {
        this.tags[id].element.classList.remove('tag-filter');
      });

      this.tags[tagId].element.classList.add('tag-filter');
      this.currentTag = tagId;

      if (this.onTagChange) {
        this.onTagChange(tagId);
      }
    }
  }

  addTag(tagName) {
    if (!tagName || !tagName.trim()) return null;

    const tagId = 'tag-' + Date.now();
    const tagElement = document.createElement('span');
    tagElement.className = 'tag';
    tagElement.id = tagId;
    tagElement.textContent = tagName.trim();

    this.tags[tagId] = { element: tagElement, name: tagName.trim() };
    
    const addTagButton = this.container.querySelector('.add-tag');
    this.container.insertBefore(tagElement, addTagButton);
    this.setupTagClickListener(tagElement);

    return tagId;
  }

  removeTag(tagId) {
    if (this.tags[tagId]) {
      this.tags[tagId].element.remove();
      delete this.tags[tagId];
    }
  }

  getAllTags() {
    return { ...this.tags };
  }

  getCurrentTag() {
    return this.currentTag;
  }

  setupEventListeners() {
    const addTagButton = this.container.querySelector('.add-tag');
    if (addTagButton) {
      addTagButton.addEventListener('click', () => {
        const tagName = prompt('Enter new tag name:');
        this.addTag(tagName);
      });
    }
  }
}
