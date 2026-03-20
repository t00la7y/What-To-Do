

import { getAllNotes, getByDate, getByDateAll } from "./task.js";

// ─── Calendar Store ───────────────────────────

export class Calendar {
  constructor() {
    this._today = new Date();
    this._viewYear = this._today.getFullYear();
    this._viewMonth = this._today.getMonth(); // 0-indexed
    this._selectedDate = null; // "YYYY-MM-DD" | null
    this.monthArr = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  }

  // ─── Date helpers ──────────────────────────

  get today() {
    return this._fmt(this._today);
  }

  get viewMonth() {
    return this._viewMonth;
  }

  get viewYear() {
    return this._viewYear;
  }

  get selectedDate() {
    return this._selectedDate;
  }

  // Format a Date → "YYYY-MM-DD"
  _fmt(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // "YYYY-MM-DD" → Date object
  _parse(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Month name from 0-indexed month number
  _monthName(month) {
    return this.monthArr[month];
  }

  // ─── Navigation ────────────────────────────

  prevMonth() {
    if (this._viewMonth === 0) {
      this._viewMonth = 11;
      this._viewYear--;
    } else {
      this._viewMonth--;
    }
    this.render();
  }

  nextMonth() {
    if (this._viewMonth === 11) {
      this._viewMonth = 0;
      this._viewYear++;
    } else {
      this._viewMonth++;
    }
    this.render();
  }

  goToToday() {
    this._viewYear = this._today.getFullYear();
    this._viewMonth = this._today.getMonth();
    this.render();
  }

  // ─── Date selection ────────────────────────

  selectDate(dateStr) {
    // Toggle off if already selected
    if (this._selectedDate === dateStr) {
      this._selectedDate = null;
    } else {
      this._selectedDate = dateStr;
    }

    // Persist selection
    localStorage.setItem("calendarSelectedDate", this._selectedDate ?? "");

    // Update the calendar UI highlight
    this._highlightSelected();

    // Trigger home page re-render for the selected date
    this._emitDateChange();
  }

  clearSelection() {
    this._selectedDate = null;
    localStorage.removeItem("calendarSelectedDate");
    this._highlightSelected();
    this._emitDateChange();
  }

  // ─── Task queries for a given date ─────────

  // Returns tasks whose dueDate matches dateStr ("YYYY-MM-DD")
  getTasksForDate(dateStr) {
    return getByDate(dateStr);
  }

  // Returns tasks created on dateStr
  getTasksCreatedOn(dateStr) {
    // dateCreated is stored as toLocaleDateString() — normalise for compare
    const target = this._parse(dateStr).toLocaleDateString();
    return getByDateAll(dateStr).filter((task) => task.dateCreated === target);
  }

  // Combined: tasks due OR created on a date
  getTasksForDateAll(dateStr) {
    return getByDateAll(dateStr);
  }

  
  getDatesWithTasks() {
    const dates = new Set();

    getAllNotes().forEach((task) => {
      if (task.dueDate) {
        dates.add(task.dueDate);
      }

      
      const createdDate = new Date(task.dateCreated);
      if (!Number.isNaN(createdDate.getTime())) {
        dates.add(this._fmt(createdDate));
      }
    });

    return dates; // Set<"YYYY-MM-DD">
  }

  buildGrid() {
    const year = this._viewYear;
    const month = this._viewMonth;

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const datesWithTasks = this.getDatesWithTasks();

    const cells = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push({
        date: null,
        day: null,
        isToday: false,
        isSelected: false,
        hasTask: false,
      });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        date: dateStr,
        day: d,
        isToday: dateStr === this.today,
        isSelected: dateStr === this._selectedDate,
        hasTask: datesWithTasks.has(dateStr),
      });
    }

    // Pad to complete the last row
    while (cells.length % 7 !== 0) {
      cells.push({
        date: null,
        day: null,
        isToday: false,
        isSelected: false,
        hasTask: false,
      });
    }

    
    const grid = [];
    for (let i = 0; i < cells.length; i += 7) {
      grid.push(cells.slice(i, i + 7));
    }
    return grid;
  }

  

  render(tableSelector = ".calendar-table", monthLabelSelector = "#month") {
    const table = document.querySelector(tableSelector);
    const monthLabel = document.querySelector(monthLabelSelector);
    if (!table) return;

   
    if (monthLabel) {
      monthLabel.textContent = `${this._monthName(this._viewMonth)} ${this._viewYear}`;
    }

   
    const tbody = table.querySelector("tbody") ?? table;
    
    const existingThead = table.querySelector("thead");

    
    const existingTbody = table.querySelector("tbody");
    if (existingTbody) {
      existingTbody.innerHTML = "";
    } else {
     
      table.querySelectorAll("tr:not(thead tr)").forEach((r) => r.remove());
    }

    const grid = this.buildGrid();
    const targetTbody = existingTbody ?? table;

    grid.forEach((week) => {
      const tr = document.createElement("tr");

      week.forEach((cell) => {
        const td = document.createElement("td");

        if (cell.day === null) {
          td.classList.add("cal-empty");
          td.textContent = "";
        } else {
          td.textContent = cell.day;
          td.dataset.date = cell.date;

          if (cell.isToday) td.classList.add("cal-today");
          if (cell.isSelected) td.classList.add("cal-selected");
          if (cell.hasTask) td.classList.add("cal-has-task");

          td.addEventListener("click", () => this.selectDate(cell.date));
        }

        tr.appendChild(td);
      });

      targetTbody.appendChild(tr);
    });
  }

  
  _highlightSelected() {
    document.querySelectorAll(".calendar-table td[data-date]").forEach((td) => {
      td.classList.toggle(
        "cal-selected",
        td.dataset.date === this._selectedDate,
      );
    });
  }

  
  _emitDateChange() {
    const event = new CustomEvent("calendarDateSelected", {
      detail: {
        date: this._selectedDate,
        tasks: this._selectedDate
          ? this.getTasksForDate(this._selectedDate)
          : null,
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

 
  save() {
    localStorage.setItem(
      "calendarView",
      JSON.stringify({
        year: this._viewYear,
        month: this._viewMonth,
      }),
    );
  }

  load() {
    const raw = localStorage.getItem("calendarView");
    if (raw) {
      const { year, month } = JSON.parse(raw);
      this._viewYear = year;
      this._viewMonth = month;
    }
  }

  initNavButtons() {
    document.addEventListener("click", (e) => {
      const action = e.target.closest("[data-cal]")?.dataset.cal;
      if (!action) return;

      if (action === "prev") this.prevMonth();
      if (action === "next") this.nextMonth();
      if (action === "today") this.goToToday();

      this.save();
    });
  }
}

export const calendar = new Calendar();
