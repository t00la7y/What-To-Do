class TagModalComponent {
  constructor(storageService) {
    this.storage = storageService;
    this.modal = null;
    this.init();
  }

  init() {
    this.createModal();
    this.setupAddTagButton();
  }

  createModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="tag-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
        <div style="background: var(--secondary-bg); padding: 2rem; border-radius: 1rem; min-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <h2 style="color: var(--text); margin-top: 0;">Add New Tag</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="color: var(--text); display: block; margin-bottom: 0.5rem;">Tag Name:</label>
              <input 
                id="new-tag-input" 
                type="text" 
                placeholder="Enter tag name..." 
                style="width: 100%; padding: 0.75rem; border: 2px solid var(--gray-hover); border-radius: 0.5rem; background: var(--primary-bg); color: var(--text);"
              />
            </div>
            <div style="display: flex; gap: 1rem;">
              <button id="tag-modal-add" style="flex: 1; padding: 0.75rem; background: var(--accent); color: var(--primary-bg); border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">Add Tag</button>
              <button id="tag-modal-close" style="flex: 1; padding: 0.75rem; background: var(--gray-hover); color: var(--text); border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = modalHTML;
    document.body.appendChild(tempDiv.firstElementChild);

    this.modal = document.getElementById("tag-modal");
    this.setupModalListeners();
  }

  setupModalListeners() {
    const addBtn = document.getElementById("tag-modal-add");
    const closeBtn = document.getElementById("tag-modal-close");
    const input = document.getElementById("new-tag-input");

    addBtn.addEventListener("click", () => {
      this.addTag(input.value);
    });

    closeBtn.addEventListener("click", () => {
      this.closeModal();
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTag(input.value);
      }
    });
  }

  setupAddTagButton() {
    // Wait for DOM to be ready, then attach to the + button
    const addTagElement = document.getElementById("addTag");
    if (addTagElement) {
      addTagElement.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openModal();
      });
    } else {
      // Retry after a short delay
      setTimeout(() => this.setupAddTagButton(), 100);
    }
  }

  openModal() {
    if (this.modal) {
      this.modal.style.display = "flex";
      document.getElementById("new-tag-input").focus();
      document.getElementById("new-tag-input").value = "";
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.style.display = "none";
    }
  }

  addTag(tagName) {
    const trimmed = tagName.trim();
    
    if (!trimmed) {
      if (window.toast) toast.warning("Please enter a tag name");
      return;
    }

    // Check if tag already exists
    const existingTag = document.getElementById(trimmed.toLowerCase().replace(/\s+/g, "-"));
    if (existingTag) {
      if (window.toast) toast.warning("This tag already exists");
      return;
    }

    // Create and add the tag to DOM
    if (window.app && window.app.tags) {
      const tagId = window.app.tags.addTag(trimmed);
      if (window.toast) toast.success(`Tag "${trimmed}" created`);
    }

    this.closeModal();
  }
}
