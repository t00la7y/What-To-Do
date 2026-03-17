/* ─────────────────────────────────────────────
   task.js — Task creation + LinkedList storage
   What-To-Do  |  t00la7y
   ───────────────────────────────────────────── */

// ─── Task Factory ─────────────────────────────

export class Task {
  constructor({
    title       = "",
    type        = "ul",        // "ul" | "ol" | "textarea"
    description = "",
    body        = [],
    tags        = [],
    priority    = "normal",    // "urgent" | "normal"
    dueDate     = "",
    status      = "not done",  // "not done" | "in progress" | "done"
  } = {}) {
    this.id           = crypto.randomUUID();
    this.title        = title;
    this.type         = type;
    this.description  = description;
    this.body         = body;
    this.tags         = tags;
    this.priority     = priority;
    this.dueDate      = dueDate;
    this.dateCreated  = new Date().toLocaleDateString();
    this.dateModified = new Date().toLocaleDateString();
    this.status       = status;
  }
}


// ─── Linked List Node ─────────────────────────

class Node {
  constructor(task) {
    this.task = task;   // Task object
    this.next = null;
  }
}


// ─── Linked List ──────────────────────────────

export class TaskList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // ── Add a new task to the end ──────────────
  append(task) {
    const node = new Node(task);

    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }

    this.size++;
    return task.id;  // return the unique id for quick reference
  }

  // ── Find a task by id — O(n) ───────────────
  findById(id) {
    let current = this.head;
    while (current) {
      if (current.task.id === id) return current.task;
      current = current.next;
    }
    return null;
  }

  // ── Update a task by id ────────────────────
  updateById(id, changes = {}) {
    let current = this.head;
    while (current) {
      if (current.task.id === id) {
        Object.assign(current.task, changes, {
          dateModified: new Date().toLocaleDateString(),
        });
        return current.task;
      }
      current = current.next;
    }
    return null;
  }

  // ── Delete a task by id ────────────────────
  deleteById(id) {
    if (!this.head) return false;

    // Head is the target
    if (this.head.task.id === id) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.task.id === id) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  // ── Return all tasks as a plain array ──────
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.task);
      current = current.next;
    }
    return result;
  }

  // ── Filter tasks (returns plain array) ─────
  filter(predicate) {
    return this.toArray().filter(predicate);
  }

  // ── Sort tasks (returns plain array) ───────
  sort(compareFn) {
    return this.toArray().sort(compareFn);
  }

  // ── Convenience: urgent tasks ──────────────
  getUrgent() {
    return this.filter((t) => t.priority === "urgent");
  }

  // ── Convenience: sort by due date ──────────
  getDueSoon() {
    return this.filter((t) => t.dueDate)
               .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  // ── Tasks due on a specific date ───────────
  // dateStr format: "YYYY-MM-DD"
  getByDate(dateStr) {
    return this.filter((t) => t.dueDate === dateStr);
  }

  // ── Tasks due OR created on a specific date ─
  getByDateAll(dateStr) {
    const target = new Date(dateStr).toLocaleDateString();
    return this.filter(
      (t) => t.dueDate === dateStr || t.dateCreated === target
    );
  }

  // ── Persist list to localStorage ──────────
  save() {
    const data = this.toArray().reduce((map, task) => {
      map[task.id] = task;
      return map;
    }, {});
    localStorage.setItem("tasks", JSON.stringify(data));
  }

  // ── Rebuild list from localStorage ─────────
  load() {
    const raw = localStorage.getItem("tasks");
    if (!raw) return;

    const data = JSON.parse(raw);
    Object.values(data).forEach((taskData) => {
      const node = new Node(taskData);  // restore plain object (no new id)
      if (!this.head) {
        this.head = node;
      } else {
        let current = this.head;
        while (current.next) current = current.next;
        current.next = node;
      }
      this.size++;
    });
  }
}


// ─── Singleton list (shared across modules) ───

export const taskList = new TaskList();


/* ─── Usage example ───────────────────────────

import { Task, taskList } from "./task.js";

// Create and append a task
const task = new Task({
  title:       "Build the JS layer",
  type:        "ul",
  description: "Wire up all localStorage helpers",
  body:        ["getNotes", "saveNote", "deleteNote"],
  tags:        ["dev", "phase-3"],
  priority:    "urgent",
  dueDate:     "2026-03-20",
});

taskList.append(task);          // appends; returns task.id
taskList.save();                // persists to localStorage

// On page load
taskList.load();                // rebuilds list from localStorage

// Query
taskList.findById(task.id);     // → Task object
taskList.getUrgent();           // → Task[]
taskList.getDueSoon();          // → Task[]

// Update
taskList.updateById(task.id, { status: "in progress" });

// Delete
taskList.deleteById(task.id);

─────────────────────────────────────────────── */
