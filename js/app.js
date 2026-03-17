import { initUI } from "./helpers.js";
import { Task, taskList } from "./task.js";
import { TagStore } from "./tags.js";
import { Calendar } from "./calendar.js";

// Initialize behaviors when the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  initUI();
});
