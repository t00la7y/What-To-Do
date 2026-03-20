import {
  getAllNotes,
  getUrgent,
  getDueSoon,
  getNoteById,
  updateNote,
  deleteNote,
  loadNotes,
} from "./task.js";
import { tagStore } from "./tags.js";
import { calendar } from "./calendar.js";

// ─── UI Init ──────────────────────────────────────────────────────────────────

export function initMobileNav() {
  const hamburger = document.querySelector(".hamburger-menu");
  const mobileNav = document.querySelector(".mobile-nav");

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileNav.classList.toggle("open");
  });
}

export function initHomeActive() {
  document.querySelector(".home")?.classList.add("active");
}

export function initCarouselHeaderHideOnScroll() {
  const carouselGroup = document.querySelector(".carousel-group");
  const carouselHeader = document.querySelector(".carousel-header");

  let lastScrollY = 0;

  carouselGroup?.addEventListener("scroll", () => {
    const currentScrollY = carouselGroup.scrollTop;

    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      carouselHeader?.classList.add("hidden");
    } else {
      carouselHeader?.classList.remove("hidden");
    }

    lastScrollY = currentScrollY;
  });
}

export function initTagPopup() {
  const tagFilterBtn = document.getElementById("listFilter");
  const tagFilterBtnCarousel = document.getElementById("listFilterCarousel");
  const navTags = document.querySelector(".nav-tags");
  const tagPopup = document.getElementById("tag-popup");
  const tagBackdrop = document.getElementById("tag-backdrop");

  const openTagPopup = () => {
    tagPopup?.classList.add("open");
    tagBackdrop?.classList.add("open");
  };

  const closeTagPopup = () => {
    tagPopup?.classList.remove("open");
    tagBackdrop?.classList.remove("open");
  };

  const toggleTagPopup = (event) => {
    event.stopPropagation();
    if (tagPopup?.classList.contains("open")) {
      closeTagPopup();
    } else {
      openTagPopup();
    }
  };

  tagFilterBtn?.addEventListener("click", toggleTagPopup);
  tagFilterBtnCarousel?.addEventListener("click", toggleTagPopup);
  navTags?.addEventListener("click", toggleTagPopup);
  tagBackdrop?.addEventListener("click", closeTagPopup);

  return { closeTagPopup };
}

export function initCreatePopup() {
  const newNoteBtn = document.getElementById("new-note-btn");
  const createPopup = document.getElementById("create-popup");
  const createBackdrop = document.getElementById("create-backdrop");
  const createCloseBtn = document.querySelector(".create-close");

  const openCreatePopup = () => {
    createPopup?.classList.add("open");
    createBackdrop?.classList.add("open");
  };

  // Resets popup to "Create Note" state.
  // Clears editingId so the next save creates a new note instead of updating.
  const closeCreatePopup = () => {
    createPopup?.classList.remove("open");
    createBackdrop?.classList.remove("open");

    const saveBtn = createPopup?.querySelector(".create-save-btn");
    if (saveBtn) delete saveBtn.dataset.editingId;

    const header = createPopup?.querySelector(".create-header h2");
    if (header) header.textContent = "Create Note";
  };

  newNoteBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    openCreatePopup();
  });

  createBackdrop?.addEventListener("click", closeCreatePopup);
  createCloseBtn?.addEventListener("click", closeCreatePopup);

  return { closeCreatePopup };
}

export function initGlobalShortcuts({ closeTagPopup, closeCreatePopup }) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTagPopup?.();
      closeCreatePopup?.();
    }
  });
}

export function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    themeToggle.querySelector("i").className = "fa-solid fa-sun";
  }

  themeToggle?.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.querySelector("i").className = isDark
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  });
}

export function initUI() {
  initMobileNav();
  initHomeActive();
  initCarouselHeaderHideOnScroll();
  updateGreeting();
  initThemeToggle();

  const { closeTagPopup } = initTagPopup();
  const { closeCreatePopup } = initCreatePopup();

  initGlobalShortcuts({ closeTagPopup, closeCreatePopup });
}

function updateGreeting() {
  const greetingEl = document.getElementById("greeting");
  if (!greetingEl) return;

  const hour = new Date().getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17) greeting = "Good Evening";

  greetingEl.textContent = greeting;
}

// ─── Calendar date selection ──────────────────────────────────────────────────
// When a date is selected, show notes due that day.
// When deselected (null), go back to normal bento dashboard.

document.addEventListener("calendarDateSelected", (e) => {
  const { date, tasks } = e.detail;
  if (date) {
    renderCarousel();
    renderDateDashboard(date, tasks);
  } else {
    renderHomePage();
  }
});

// ─── Render ───────────────────────────────────────────────────────────────────

export function renderHomePage() {
  renderCarousel();
  renderBentoDashboard();
}

export function renderHomePageForDate(date, tasks) {
  renderCarousel();
  renderDateDashboard(date, tasks);
}

function renderCarousel() {
  const carouselList = document.querySelector(".carousel-list");
  if (!carouselList) return;

  carouselList.innerHTML = "";

  const tasks = tagStore.getFiltered();

  tasks.forEach((task) => {
    const date = new Date(task.dateCreated);
    const day = isNaN(date.getTime()) ? "" : date.getDate();
    const month = isNaN(date.getTime())
      ? ""
      : calendar.monthArr[date.getMonth()];
    const formattedDate = `${day} ${month}`;

    const li = document.createElement("li");
    li.className = "list-item";

    const maxTags = 3;
    const visibleTags = task.tags.slice(0, maxTags);
    const remaining = task.tags.length - maxTags;
    const tagDisplay =
      visibleTags.map((tag) => `<p class="note-tag">${tag}</p>`).join("") +
      (remaining > 0 ? `<p class="note-tag">+${remaining} more</p>` : "");

    li.innerHTML = `
      <div class="note-card" data-id="${task.id}">
        <h4 class="dateCreated">${formattedDate}</h4>
        <h2 class="note-title">${task.title}</h2>
        <div class="card-description">
          <p>${task.description}</p>
        </div>
        <div class="note-tags">
          ${tagDisplay}
        </div>
      </div>
    `;

    li.querySelector(".note-card").addEventListener("click", () => {
      renderViewNote(task.id);
    });

    carouselList.appendChild(li);
  });
}

// Shows notes due on a specific calendar-selected date.
function renderDateDashboard(date, tasks) {
  const homeContent = document.querySelector(".home-content");
  if (!homeContent) return;

  homeContent.innerHTML = "";

  const d = new Date(date);
  const label = `${d.getDate()} ${calendar.monthArr[d.getMonth()]} ${d.getFullYear()}`;

  if (!tasks || tasks.length === 0) {
    homeContent.innerHTML = `
      <div class="home-section">
        <div class="home-section-header">
          <i class="fa-solid fa-calendar-day"></i>
          <h2>${label}</h2>
        </div>
        <p style="color: var(--text-muted); font-size: var(--font-s); padding: 0.5rem 0;">
          No notes due on this date.
        </p>
      </div>
    `;
    return;
  }

  const section = document.createElement("div");
  section.className = "home-section";
  section.innerHTML = `
    <div class="home-section-header">
      <i class="fa-solid fa-calendar-day"></i>
      <h2>${label}</h2>
    </div>
    <div class="home-cards-row">
      ${tasks
        .map(
          (task) => `
        <div class="home-card" data-id="${task.id}">
          <span class="home-card-date">${task.status}</span>
          <h3 class="home-card-title">${task.title}</h3>
          <div class="home-card-tags">
            ${task.tags.map((tag) => `<span class="note-tag">${tag}</span>`).join("")}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  section.querySelectorAll(".home-card").forEach((card) => {
    card.addEventListener("click", () => renderViewNote(card.dataset.id));
  });

  homeContent.appendChild(section);
}

// Bento grid layout:
// - Big card (3col x 4row)  — closest due date
// - Side cards (3col x 2row) — urgent notes, or next due if fewer than 2 urgent
// - Rest — freestyle small cards (2col x 2row)
function renderBentoDashboard() {
  const homeContent = document.querySelector(".home-content");
  if (!homeContent) return;
  homeContent.innerHTML = "";

  const allTasks = tagStore.getFiltered();
  if (allTasks.length === 0) return;

  const sorted = [...allTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const urgent = allTasks.filter((t) => t.priority === "urgent");
  const bigCard = sorted[0];
  const sideCards =
    urgent.length >= 2 ? [urgent[0], urgent[1]] : sorted.slice(1, 3);
  const rest = allTasks.filter(
    (t) => t.id !== bigCard.id && !sideCards.find((s) => s.id === t.id),
  );

  const grid = document.createElement("div");
  grid.className = "bento-grid";

  grid.appendChild(createBentoCard(bigCard, "bento-card-big"));
  sideCards.forEach((task) => {
    grid.appendChild(createBentoCard(task, "bento-card-side"));
  });
  rest.forEach((task) => {
    grid.appendChild(createBentoCard(task, "bento-card-small"));
  });

  homeContent.appendChild(grid);
}

function createBentoCard(task, sizeClass) {
  const card = document.createElement("div");
  card.className = `home-card ${sizeClass}`;
  card.dataset.id = task.id;

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "No date";
    return `${d.getDate()} ${calendar.monthArr[d.getMonth()]}`;
  };

  card.innerHTML = `
    <span class="home-card-date">${formatDateShort(task.dueDate)}</span>
    <h3 class="home-card-title">${task.title}</h3>
    <p class="home-card-desc">${task.description}</p>
    <div class="home-card-tags">
      ${task.tags.map((tag) => `<span class="note-tag">${tag}</span>`).join("")}
    </div>
  `;

  card.addEventListener("click", () => renderViewNote(task.id));
  return card;
}

// ─── View Note ────────────────────────────────────────────────────────────────

export function renderViewNote(taskId) {
  const task = getNoteById(taskId);
  if (!task) return;

  document.querySelector(".home")?.classList.remove("active");
  document.querySelector(".to-do-Note")?.classList.add("active");

  const titleEl = document.querySelector(".view-note-header .title");
  if (titleEl) titleEl.textContent = task.title;

  const descEl = document.querySelector(".note-description");
  if (descEl) descEl.textContent = task.description;

  const dateDueEl = document.querySelector(".dateDue");
  if (dateDueEl) {
    const date = task.dueDate ? new Date(task.dueDate) : null;
    if (date && !Number.isNaN(date.getTime())) {
      dateDueEl.textContent = `${date.getDate()} ${calendar.monthArr[date.getMonth()]}`;
    } else {
      dateDueEl.textContent = "No due date";
    }
  }

  const cardStatusEl = document.querySelector(".cardStatus");
  if (cardStatusEl) cardStatusEl.textContent = task.status;

  // Show repeat — "—" if none set
  const repeatEl = document.querySelector(".cardRepeat");
  if (repeatEl) {
    repeatEl.textContent =
      task.repeat && task.repeat !== "none" ? task.repeat : "—";
  }

  const dateModifiedEl = document.querySelector(".dateModified");
  if (dateModifiedEl) dateModifiedEl.textContent = task.dateModified;

  const noteTagsEl = document.querySelector(".view-note-body .note-tags");
  if (noteTagsEl) {
    noteTagsEl.innerHTML = task.tags
      .map((tag) => `<p class="note-tag">${tag}</p>`)
      .join("");
  }

  const detailEl = document.querySelector(".view-note-detail");
  if (detailEl) {
    // Hide any leftover elements from a previously viewed note
    detailEl
      .querySelectorAll("ul, ol, textarea")
      .forEach((el) => (el.style.display = "none"));

    const refreshNoteMeta = (updated) => {
      if (!updated) return;
      const statusEl = document.querySelector(".cardStatus");
      const modifiedEl = document.querySelector(".dateModified");
      if (statusEl) statusEl.textContent = updated.status;
      if (modifiedEl) modifiedEl.textContent = updated.dateModified;
    };

    if (task.type === "textarea") {
      let textarea = detailEl.querySelector("textarea");
      if (!textarea) {
        textarea = document.createElement("textarea");
        textarea.className = "note-textarea";
        detailEl.appendChild(textarea);
      }
      textarea.value = (task.body[0]?.text ?? "").toString();
      textarea.style.display = "block";

      let timeout;
      textarea.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const lines = textarea.value
            .split("\n")
            .map((line) => ({ text: line, done: false }));
          const updated = updateNote(task.id, { body: lines });
          refreshNoteMeta(updated);
        }, 600);
      });
    } else {
      const listType = task.type === "ol" ? "ol" : "ul";
      let list = detailEl.querySelector(listType);
      if (!list) {
        list = document.createElement(listType);
        list.className = "note-check-list";
        detailEl.appendChild(list);
      }

      list.innerHTML = task.body
        .map((item, index) => {
          const doneClass = item.done ? "done" : "";
          const checkedAttr = item.done ? "checked" : "";
          return `
            <li class="check-item ${doneClass}" data-index="${index}">
              <label>
                <input type="checkbox" ${checkedAttr} />
                <span class="check-box"></span>
                <span>${item.text}</span>
              </label>
            </li>
          `;
        })
        .join("");

      list.style.display = "block";

      list.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const listItem = e.target.closest(".check-item");
          const index = Number(listItem.dataset.index);

          const currentTask = getNoteById(task.id);
          const newBody = [...(currentTask?.body ?? [])];
          newBody[index] = {
            ...newBody[index],
            done: e.target.checked,
          };

          const updated = updateNote(task.id, { body: newBody });
          refreshNoteMeta(updated);

          listItem.classList.toggle("done", e.target.checked);
        });
      });
    }
  }

  initNoteOptions(taskId);
}

// ─── Edit Popup ───────────────────────────────────────────────────────────────

// Pre-fills ALL fields from the existing note so the save handler
// never overwrites anything with an empty value.
function openEditPopup(taskId) {
  const task = getNoteById(taskId);
  if (!task) return;

  const createPopup = document.getElementById("create-popup");
  const createBackdrop = document.getElementById("create-backdrop");

  if (!createPopup) return;

  const header = createPopup.querySelector(".create-header h2");
  const titleInput = createPopup.querySelector(".create-title-input");
  const bodyTextarea = createPopup.querySelector(".create-body-input");
  const typeBtns = createPopup.querySelectorAll(".type-btn");
  const tagsPreview = createPopup.querySelector(".create-tags-preview");
  const prioritySelect = createPopup.querySelector(".create-priority-select");
  const dueInput = createPopup.querySelector(".create-due-input");
  const repeatSelect = createPopup.querySelector(".create-repeat-select");
  const itemsContainer = document.getElementById("create-items-input");

  // Basic fields
  if (header) header.textContent = "Edit Note";
  if (titleInput) titleInput.value = task.title;
  if (bodyTextarea) bodyTextarea.value = task.description;
  if (prioritySelect) prioritySelect.value = task.priority;
  if (dueInput) dueInput.value = task.dueDate;
  if (repeatSelect) repeatSelect.value = task.repeat ?? "none";

  // Type buttons
  typeBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === task.type);
  });

  // Tags — rendered as pills so save handler can read them via .create-tag-pill
  if (tagsPreview) {
    tagsPreview.innerHTML = task.tags
      .map(
        (tag) => `
        <span class="create-tag-pill" data-tag="${tag}">
          ${tag}
          <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:4px;"></i>
        </span>
      `,
      )
      .join("");

    tagsPreview.querySelectorAll(".create-tag-pill i").forEach((icon) => {
      icon.addEventListener("click", () =>
        icon.closest(".create-tag-pill").remove(),
      );
    });
  }

  // Body items — pre-fill #create-items-input so save doesn't read empty list
  if (itemsContainer) {
    if (task.type === "textarea") {
      itemsContainer.innerHTML = `
        <textarea class="create-note-body">${task.body.map((i) => i.text).join("\n")}</textarea>
      `;
    } else {
      itemsContainer.innerHTML = `
        <ul class="create-checklist-preview">
          ${task.body
            .map(
              (item) => `
            <li data-text="${item.text}">
              ${item.text}
              <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:0.5rem; color:var(--text-muted)"></i>
            </li>
          `,
            )
            .join("")}
        </ul>
        <input type="text" class="create-item-input" placeholder="Add item, press Enter" />
      `;

      // Wire delete buttons on pre-filled items
      itemsContainer.querySelectorAll("li i").forEach((icon) => {
        icon.addEventListener("click", () => icon.closest("li").remove());
      });

      // Wire add-item input
      const itemInput = itemsContainer.querySelector(".create-item-input");
      const itemList = itemsContainer.querySelector(
        ".create-checklist-preview",
      );

      itemInput?.addEventListener("keypress", (e) => {
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

  // Stamp editing ID onto save button so app.js knows this is an update
  const saveBtn = createPopup.querySelector(".create-save-btn");
  if (saveBtn) saveBtn.dataset.editingId = taskId;

  createPopup.classList.add("open");
  createBackdrop?.classList.add("open");
}

// ─── Note Options Menu ────────────────────────────────────────────────────────

// Clone-and-replace pattern removes stale event listeners from
// previously viewed notes — without this, clicking Edit on note B
// would open the edit popup for note A.
function initNoteOptions(taskId) {
  const optionsIcon = document.querySelector(".note-options");
  const optionsMenu = document.querySelector(".note-options-menu");
  const editBtn = document.querySelector(".edit-note-btn");
  const deleteBtn = document.querySelector(".delete-note-btn");

  if (optionsIcon && optionsMenu) {
    const freshIcon = optionsIcon.cloneNode(true);
    optionsIcon.parentNode.replaceChild(freshIcon, optionsIcon);

    freshIcon.addEventListener("click", () => {
      optionsMenu.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!freshIcon.contains(e.target) && !optionsMenu.contains(e.target)) {
        optionsMenu.classList.remove("active");
      }
    });
  }

  if (editBtn) {
    const freshEdit = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(freshEdit, editBtn);

    freshEdit.addEventListener("click", () => {
      openEditPopup(taskId);
      optionsMenu?.classList.remove("active");
    });
  }

  if (deleteBtn) {
    const freshDelete = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(freshDelete, deleteBtn);

    freshDelete.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this note?")) {
        deleteNote(taskId);
        backToHome();
        renderHomePage();
        showToast("Note deleted successfully!", "success");
      }
      optionsMenu?.classList.remove("active");
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function backToHome() {
  document.querySelector(".to-do-Note")?.classList.remove("active");
  document.querySelector(".home")?.classList.add("active");
  renderHomePage();
}

export function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span class="close-btn">&times;</span>
  `;

  toast.querySelector(".close-btn").addEventListener("click", () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.classList.remove("show");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

export function refreshApp() {
  loadNotes(); 
  tagStore.load();
  renderHomePage();
  calendar.render(".desktop-nav .calendar-table", "#month");
  calendar.render(".mobile-nav .calendar-table", "#month-mobile");
}
