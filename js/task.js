export class Task {
  constructor({
    title       = "",
    type        = "ul",
    description = "",
    body        = [],
    tags        = [],
    priority    = "normal",
    dueDate     = "",
    repeat = "none",
    status      = "not done",
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
    this.repeat = repeat ?? "none"; 
  }
}

const STORAGE_KEY = "notes";
const notesStore = {};

export function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : {};
  Object.keys(data).forEach((id) => {
    notesStore[id] = data[id];
  });
  processRepeatingNotes();
}

export function processRepeatingNotes() {
  const today = new Date().toISOString().split("T")[0];

  getAllNotes().forEach((note) => {
    if (!note.repeat || note.repeat === "none") return;
    if (!note.dueDate) return;
    if (note.dueDate >= today) return; // not overdue yet, nothing to do

    // Advance dueDate forward until it's >= today
    let due = new Date(note.dueDate);

    while (due.toISOString().split("T")[0] < today) {
      if (note.repeat === "Daily") due.setDate(due.getDate() + 1);
      else if (note.repeat === "Weekly") due.setDate(due.getDate() + 7);
      else if (note.repeat === "Monthly") due.setMonth(due.getMonth() + 1);
    }

    updateNote(note.id, {
      dueDate: due.toISOString().split("T")[0],
      status: "not done",
      body: note.body.map((item) => ({ ...item, done: false })), // reset checklist
    });
  });
}

export function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notesStore));
}

export function getAllNotes() {
  return Object.values(notesStore);
}

export function getNoteById(id) {
  return notesStore[id] ?? null;
}

export function addNote(note) {
  notesStore[note.id] = note;
  saveNotes();
  return note;
}

export function deleteNote(id) {
  if (!notesStore[id]) return false;
  delete notesStore[id];
  saveNotes();
  return true;
}

export function updateNote(id, changes = {}) {
  if (!notesStore[id]) return null;

  notesStore[id] = {
    ...notesStore[id],
    ...changes,
    dateModified: new Date().toLocaleDateString(),
    status: computeStatus(changes.body ?? notesStore[id].body),
  };

  saveNotes();
  return notesStore[id];
}

export function computeStatus(body) {
  if (!Array.isArray(body) || body.length === 0) return "not done";
  const done = body.filter((item) => item.done).length;
  if (done === body.length) return "done";
  if (done > 0) return "in progress";
  return "not done";
}

export function getUrgent() {
  return getAllNotes().filter((t) => t.priority === "urgent");
}

export function getDueSoon() {
  return getAllNotes()
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

export function getByDate(dateStr) {
  return getAllNotes().filter((t) => t.dueDate === dateStr);
}

export function getByDateAll(dateStr) {
  const target = new Date(dateStr).toLocaleDateString();
  return getAllNotes().filter(
    (t) => t.dueDate === dateStr || t.dateCreated === target
  );
}

