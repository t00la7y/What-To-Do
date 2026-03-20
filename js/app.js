import { initUI, renderHomePage, backToHome, showToast,refreshApp } from "./helpers.js";
import { Task, loadNotes, addNote, updateNote, getNoteById } from "./task.js";
import { tagStore } from "./tags.js";
import { Calendar, calendar } from "./calendar.js";

document.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  tagStore.load();
  calendar.load();

  calendar.render(".desktop-nav .calendar-table", "#month");
  calendar.render(".mobile-nav .calendar-table", "#month-mobile");
  calendar.initNavButtons();

  renderHomePage();
  initUI();
  initCreateNoteSave();
  initTagManagement();
  setupNavigation();
});

// ─── Navigation ───────────────────────────────────────────────────────────────

function setupNavigation() {
  const desktopNavItems = document.querySelectorAll(".desktop-nav .nav-item[data-action]");
  const mobileNavItems = document.querySelectorAll(".mobile-nav-list li[data-action]");
  const hamburger = document.querySelector(".hamburger-menu");
  const mobileNav = document.querySelector(".mobile-nav");

  const closeMobileNav = () => {
    hamburger?.classList.remove("open");
    mobileNav?.classList.remove("open");
  };

  desktopNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      handleNavAction(item.dataset.action, { closeMobile: false });
    });
  });

  mobileNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      handleNavAction(item.dataset.action, { closeMobile: true });
    });
  });

  function handleNavAction(action, { closeMobile } = {}) {
    if (!action) return;
    if (closeMobile) closeMobileNav();

    const setActive = (a) => {
      desktopNavItems.forEach((navItem) => {
        navItem.classList.toggle("active-nav", navItem.dataset.action === a);
      });
    };

    switch (action) {
      case "home":
        setActive("home");
        tagStore.clearFilter();
        backToHome();
        refreshApp();
        break;
      case "new-note":
        setActive("new-note");
        openCreatePopup();
        break;
      case "tags":
        setActive("tags");
        openTagPopup();
        break;
      case "settings":
        setActive("settings");
        showToast("Settings not implemented yet", "warning");
        break;
      default:
        break;
    }
  }

  function openCreatePopup() {
    document.getElementById("create-popup")?.classList.add("open");
    document.getElementById("create-backdrop")?.classList.add("open");
  }

  function openTagPopup() {
    document.getElementById("tag-popup")?.classList.add("open");
    document.getElementById("tag-backdrop")?.classList.add("open");
  }
}

// ─── Create Note Popup ────────────────────────────────────────────────────────

// Renders the body input area based on the selected note type.
// For textarea: a single textarea.
// For ul/ol: a list builder with an input and delete buttons per item.
function renderItemsInput(type) {
  const container = document.getElementById("create-items-input");
  if (!container) return;

  container.innerHTML = "";

  if (type === "textarea") {
    container.innerHTML = `
      <textarea class="create-note-body" placeholder="Write your note..."></textarea>
    `;
  } else {
    container.innerHTML = `
      <ul class="create-checklist-preview"></ul>
      <input type="text" class="create-item-input" placeholder="Add item, press Enter" />
    `;

    const itemInput = container.querySelector(".create-item-input");
    const itemList = container.querySelector(".create-checklist-preview");

    itemInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && itemInput.value.trim()) {
        const text = itemInput.value.trim();
        const li = document.createElement("li");
        li.dataset.text = text;
        li.innerHTML = `
          ${text}
          <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:0.5rem; color:var(--text-muted)"></i>
        `;
        li.querySelector("i").addEventListener("click", () => li.remove());
        itemList.appendChild(li);
        itemInput.value = "";
      }
    });
  }
}

// Wires up the tag pill builder inside the create popup.
// Each tag is added as a pill on Enter and can be removed by clicking ×.
// On save, pills are read instead of the raw input value.
function initCreateTagInput() {
  const tagInput = document.querySelector(".create-tag-input");
  const tagsPreview = document.querySelector(".create-tags-preview");
  if (!tagInput || !tagsPreview) return;

  tagInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = tagInput.value.trim().toLowerCase();
      if (!value) return;

      // Don't add duplicate pills
      const existing = Array.from(
        tagsPreview.querySelectorAll(".create-tag-pill")
      ).map((el) => el.dataset.tag);

      if (existing.includes(value)) {
        tagInput.value = "";
        return;
      }

      const pill = document.createElement("span");
      pill.className = "create-tag-pill";
      pill.dataset.tag = value;
      pill.innerHTML = `
        ${value}
        <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:4px;"></i>
      `;
      pill.querySelector("i").addEventListener("click", () => pill.remove());
      tagsPreview.appendChild(pill);
      tagInput.value = "";
    }
  });
}

function initCreateNoteSave() {
  // Switch note type and re-render the body input area
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".type-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderItemsInput(btn.dataset.type);
    });
  });

  const saveBtn = document.querySelector(".create-save-btn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    // Read all form values at the moment of save — never before
    const title = document.querySelector(".create-title-input").value.trim();
    const type = document.querySelector(".type-btn.active")?.dataset.type || "ul";
    const description = document.querySelector(".create-body-input").value.trim();
    const tagsInput = document.querySelector(".create-tag-input").value.trim();
    const priority = document.querySelector(".create-priority-select").value;
    const dueDate = document.querySelector(".create-due-input").value;
    const repeat = document.querySelector(".create-repeat-select").value;

    if (!title) return;

    // Read tags from pills — not from the raw input
    const pills = document.querySelectorAll(".create-tags-preview .create-tag-pill");
    const tags = Array.from(pills).map((p) => p.dataset.tag);

    // Build body from the items input area
    let body = [];
    if (type === "textarea") {
      const noteBody = document.querySelector(".create-note-body")?.value ?? "";
      body = noteBody.split("\n").map((line) => ({ text: line, done: false }));
    } else {
      const items = document.querySelectorAll(".create-checklist-preview li");
      body = Array.from(items).map((li) => ({
        text: li.dataset.text,
        done: false,
      }));
    }

    const newTask = new Task({
      title,
      type,
      description,
      body,
      tags,
      priority,
      dueDate,
      repeat,
    });

    // editingId is stamped onto the button by openEditPopup() in helpers.js
    const editingId = saveBtn.dataset.editingId;

    if (editingId) {
      updateNote(editingId, {
        title,
        type,
        description,
        body,
        tags,
        priority,
        dueDate,
        repeat,
      });
      showToast("Note updated!", "success");
    } else {
      addNote(newTask);
      showToast("Note created successfully!", "success");
    }

    // Register any new tags in the global tag store
    tags.forEach((tag) => tagStore.add(tag));
    tagStore.save();

    // Clear all form fields
    document.querySelector(".create-title-input").value = "";
    document.querySelector(".create-body-input").value = "";
    document.querySelector(".create-tag-input").value = "";
    document.querySelector(".create-due-input").value = "";
    document.querySelector(".create-repeat-select").value = "none";
    document.querySelector(".create-tags-preview").innerHTML = "";
    const container = document.getElementById("create-items-input");
    if (container) container.innerHTML = "";

    // Close popup
    document.getElementById("create-popup")?.classList.remove("open");
    document.getElementById("create-backdrop")?.classList.remove("open");

    renderHomePage();
  });

  // Set up tag pill input
  initCreateTagInput();

  // Render default body input (ul) on page load
  renderItemsInput("ul");
}

// ─── Tag Management ───────────────────────────────────────────────────────────

function initTagManagement() {
  const tagInput = document.querySelector(".tag-add-input");
  const tagList = document.getElementById("tag-list");

  if (tagInput) {
    tagInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const tagName = tagInput.value.trim();
        if (tagName && tagStore.add(tagName)) {
          tagStore.save();
          renderTagList();
          tagInput.value = "";
          showToast(`Tag "${tagName}" added!`, "success");
        } else if (tagName) {
          showToast(`Tag "${tagName}" already exists!`, "warning");
        }
      }
    });
  }

  if (tagList) {
    tagList.addEventListener("click", (e) => {
      const tagEl = e.target.closest(".tag");
      if (!tagEl) return;

      if (e.target.classList.contains("tag-delete")) {
        // Delete tag from global store and all notes
        const tagName = tagEl.textContent.replace("×", "").trim();
        if (tagStore.delete(tagName)) {
          renderTagList();
          showToast(`Tag "${tagName}" deleted!`, "info");
        }
      } else {
        // Toggle filter — clicking active tag clears it, clicking new tag sets it
        const tagName = tagEl.textContent.replace("×", "").trim();

        if (tagStore.activeFilter === tagName) {
          tagStore.clearFilter();
          showToast("Filter cleared", "info");
        } else {
          tagStore.setFilter(tagName);
          showToast(`Filtering by "${tagName}"`, "info");
        }

        document.getElementById("tag-popup")?.classList.remove("open");
        document.getElementById("tag-backdrop")?.classList.remove("open");
        renderHomePage();
      }
    });
  }

  renderTagList();
}

function renderTagList() {
  const tagList = document.getElementById("tag-list");
  if (!tagList) return;

  tagList.innerHTML = tagStore.all
    .map(
      (tag) =>
        `<li class="tag">${tag} <i class="fa-solid fa-xmark tag-delete"></i></li>`
    )
    .join("");
}