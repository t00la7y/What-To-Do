import { getAllNotes, getNoteById, updateNote } from "./task.js";


export class TagStore {
  constructor() {
    this._tags = [];           
    this._activeFilter = null; 
  }

  

  get all() {
    return [...this._tags];    
  }

  get activeFilter() {
    return this._activeFilter;
  }

  
  add(name) {
    const clean = name.trim().toLowerCase();
    if (!clean) return false;
    if (this._tags.includes(clean)) return false;

    this._tags.push(clean);
    this.save();
    return true;
  }

 
  delete(name) {
    const clean = name.trim().toLowerCase();
    const idx = this._tags.indexOf(clean);
    if (idx === -1) return false;

  
    this._tags.splice(idx, 1);

    
    getAllNotes().forEach((note) => {
      if (note.tags.includes(clean)) {
        const updatedTags = note.tags.filter((tag) => tag !== clean);
        updateNote(note.id, { tags: updatedTags });
      }
    });
    
    this.save();

    if (this._activeFilter === clean) this.clearFilter();

    return true;
  }

  rename(oldName, newName) {
    const oldClean = oldName.trim().toLowerCase();
    const newClean = newName.trim().toLowerCase();

    if (!newClean) return false;
    if (!this._tags.includes(oldClean)) return false;
    if (this._tags.includes(newClean)) return false;

    const idx = this._tags.indexOf(oldClean);
    this._tags[idx] = newClean;

    getAllNotes().forEach((note) => {
      if (note.tags.includes(oldClean)) {
        const updatedTags = note.tags.map((tag) => (tag === oldClean ? newClean : tag));
        updateNote(note.id, { tags: updatedTags });
      }
    });

    this.save();

    if (this._activeFilter === oldClean) this._activeFilter = newClean;

    return true;
  }

  has(name) {
    return this._tags.includes(name.trim().toLowerCase());
  }

  setFilter(name = null) {
    this._activeFilter = name ? name.trim().toLowerCase() : null;
    return this.getFiltered();
  }

  clearFilter() {
    this._activeFilter = null;
  }

  getFiltered() {
    if (!this._activeFilter) return getAllNotes();
    return getAllNotes().filter((note) =>
      note.tags.includes(this._activeFilter)
    );
  }

  getForTask(taskId) {
    const note = getNoteById(taskId);
    return note ? [...note.tags] : [];
  }

  addToTask(taskId, name) {
    const clean = name.trim().toLowerCase();
    const note = getNoteById(taskId);
    if (!note) return false;

    this.add(clean);

    if (!note.tags.includes(clean)) {
      updateNote(taskId, { tags: [...note.tags, clean] });
    }
    return true;
  }

  removeFromTask(taskId, name) {
    const clean = name.trim().toLowerCase();
    const note = getNoteById(taskId);
    if (!note) return false;

    const updatedTags = note.tags.filter((t) => t !== clean);
    updateNote(taskId, { tags: updatedTags });
    return true;
  }

  
  save() {
    localStorage.setItem("tags", JSON.stringify(this._tags));
  }

  load() {
    const raw = localStorage.getItem("tags");
    if (!raw) return;
    this._tags = JSON.parse(raw);
  }
}


export const tagStore = new TagStore();
