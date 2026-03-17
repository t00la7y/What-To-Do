/* ─────────────────────────────────────────────
   tags.js — Tag creation, storage & filtering
   What-To-Do  |  t00la7y
   ───────────────────────────────────────────── */

import { taskList } from "./task.js";

// ─── Tag Store ────────────────────────────────
// Tags are stored globally as a flat array of
// unique strings.  Tasks reference tags by name
// (string match), not by id — keeps it simple
// and avoids foreign-key overhead for this phase.

export class TagStore {
  constructor() {
    this._tags = [];           // ["dev", "urgent", "work", …]
    this._activeFilter = null; // currently selected tag for filtering
  }

  // ── Getters ───────────────────────────────

  get all() {
    return [...this._tags];    // return a copy — no external mutation
  }

  get activeFilter() {
    return this._activeFilter;
  }

  // ── Add a tag ─────────────────────────────
  // Normalises to lowercase, trims whitespace,
  // silently ignores duplicates.
  add(name) {
    const clean = name.trim().toLowerCase();
    if (!clean) return false;
    if (this._tags.includes(clean)) return false;

    this._tags.push(clean);
    this.save();
    return true;
  }

  // ── Delete a tag ──────────────────────────
  // Removes from the global list AND strips it
  // from every task that references it.
  delete(name) {
    const clean = name.trim().toLowerCase();
    const idx   = this._tags.indexOf(clean);
    if (idx === -1) return false;

    // 1. Remove from global list
    this._tags.splice(idx, 1);

    // 2. Strip from every task
    taskList.toArray().forEach((task) => {
      const tagIdx = task.tags.indexOf(clean);
      if (tagIdx !== -1) {
        task.tags.splice(tagIdx, 1);
      }
    });

    // 3. Persist both stores
    taskList.save();
    this.save();

    // 4. Clear filter if it was pointing at the deleted tag
    if (this._activeFilter === clean) this.clearFilter();

    return true;
  }

  // ── Rename a tag ──────────────────────────
  rename(oldName, newName) {
    const oldClean = oldName.trim().toLowerCase();
    const newClean = newName.trim().toLowerCase();

    if (!newClean)                        return false;
    if (!this._tags.includes(oldClean))   return false;
    if (this._tags.includes(newClean))    return false;

    // 1. Update global list
    const idx = this._tags.indexOf(oldClean);
    this._tags[idx] = newClean;

    // 2. Update every task that uses the old name
    taskList.toArray().forEach((task) => {
      const tagIdx = task.tags.indexOf(oldClean);
      if (tagIdx !== -1) task.tags[tagIdx] = newClean;
    });

    taskList.save();
    this.save();

    if (this._activeFilter === oldClean) this._activeFilter = newClean;

    return true;
  }

  // ── Check existence ───────────────────────
  has(name) {
    return this._tags.includes(name.trim().toLowerCase());
  }

  // ── Filter tasks by tag ───────────────────
  // Sets the active filter and returns matching tasks.
  // Pass null / no argument to clear filter.
  setFilter(name = null) {
    this._activeFilter = name ? name.trim().toLowerCase() : null;
    return this.getFiltered();
  }

  clearFilter() {
    this._activeFilter = null;
  }

  // Returns all tasks that match the active filter.
  // If no filter is set, returns all tasks.
  getFiltered() {
    if (!this._activeFilter) return taskList.toArray();
    return taskList.filter((task) =>
      task.tags.includes(this._activeFilter)
    );
  }

  // ── Tags for a specific task ──────────────
  getForTask(taskId) {
    const task = taskList.findById(taskId);
    return task ? [...task.tags] : [];
  }

  // ── Add a tag to a specific task ──────────
  addToTask(taskId, name) {
    const clean = name.trim().toLowerCase();
    const task  = taskList.findById(taskId);
    if (!task) return false;

    // Auto-register in global list if new
    this.add(clean);

    if (!task.tags.includes(clean)) {
      task.tags.push(clean);
      taskList.save();
    }
    return true;
  }

  // ── Remove a tag from a specific task ─────
  removeFromTask(taskId, name) {
    const clean = name.trim().toLowerCase();
    const task  = taskList.findById(taskId);
    if (!task) return false;

    const idx = task.tags.indexOf(clean);
    if (idx !== -1) {
      task.tags.splice(idx, 1);
      taskList.save();
    }
    return true;
  }

  // ── Persist to localStorage ───────────────
  save() {
    localStorage.setItem("tags", JSON.stringify(this._tags));
  }

  // ── Load from localStorage ────────────────
  load() {
    const raw = localStorage.getItem("tags");
    if (!raw) return;
    this._tags = JSON.parse(raw);
  }
}

// ─── Singleton ────────────────────────────────
export const tagStore = new TagStore();


/* ─── Usage example ───────────────────────────

import { tagStore } from "./tags.js";

// Setup (on page load — after taskList.load())
tagStore.load();

// Global tag management
tagStore.add("dev");          // → true
tagStore.add("Dev");          // → false  (duplicate, normalised)
tagStore.all;                 // → ["dev"]

tagStore.delete("dev");       // removes from list + all tasks
tagStore.rename("dev", "code");

// Per-task tag management
tagStore.addToTask(taskId, "urgent");    // auto-registers globally
tagStore.removeFromTask(taskId, "urgent");
tagStore.getForTask(taskId);             // → ["dev", "work"]

// Filtering
tagStore.setFilter("dev");    // → Task[] with tag "dev"
tagStore.getFiltered();       // → same result
tagStore.clearFilter();       // back to showing all

─────────────────────────────────────────────── */
