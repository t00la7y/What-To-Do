# What-To-Do

A clean, fast, single-page productivity app for managing notes and tasks.
Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

**Developer:** Mpilo Shezi  
**Live Demo:** *(add link here)*  
**Repo:** https://github.com/t00la7y/What-To-Do  

---

## Overview

What-To-Do is a fully client-side productivity application that lets users
create, organise, and track tasks across three note types — checklists,
ordered lists, and free-text notes. It features a bento grid dashboard,
calendar-based filtering, tag organisation, recurring tasks, and dark mode.
All data persists offline via localStorage with no backend required.

---

## Features

### Note Types
- **Unordered checklist** — bullet-point tasks with toggle completion
- **Ordered checklist** — numbered tasks with CSS counter styling
- **Textarea** — free-form text notes with auto-save

### Dashboard
- **Bento grid layout** — intelligent card sizing based on priority and due date
  - Big card (featured) — note with the nearest due date
  - Side cards — urgent notes, or next due if no urgent notes exist
  - Small freestyle cards — all remaining notes
- **Calendar date filter** — click any date to view notes due that day
- **Tag filter** — click any tag to filter the entire view; click again to clear

### Task Management
- Create, edit, and delete notes
- Priority levels — urgent or normal
- Due dates with calendar integration
- Repeating tasks — daily, weekly, or monthly
  - Overdue repeating notes auto-advance their due date on page load
  - Checklists reset automatically on each recurrence
- Status auto-computed from checklist completion — not done / in progress / done

### Organisation
- Global tag management — create and delete tags
- Multi-tag support per note — add tags as pills in the create/edit popup
- Tag filtering persists across navigation

### UI & Experience
- Dark mode with localStorage persistence
- Responsive layout — full desktop sidebar, mini sidebar, mobile hamburger menu
- Carousel header hides on scroll for more reading space
- Toast notifications for all user actions
- Smooth SPA transitions — fade and translate animations between views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 — custom properties, `clamp()`, media queries |
| Logic | Vanilla JavaScript — ES6 modules |
| Storage | Browser localStorage API |
| Icons | Font Awesome 6.5 |
| Build | None — no bundler, no framework |

---

## Project Structure

```
What-To-Do/
├── index.html
│
├── css/
│   ├── style.css         # Entry point — imports all stylesheets
│   ├── modal.css         # CSS variables + dark mode + base styles
│   ├── layout.css        # Two-column flex layout
│   ├── nav.css           # Sidebar + responsive navigation
│   ├── home.css          # Dashboard + bento grid
│   ├── carousel.css      # Note card list
│   ├── note.css          # View note panel
│   ├── calendar.css      # Calendar table
│   ├── popups.css        # Create/edit popup
│   ├── tags.css          # Tag pill UI
│   └── toast.css         # Notification styles
│
└── js/
    ├── app.js            # Entry point — navigation, create/edit save logic
    ├── helpers.js        # All rendering, UI init, view note, toast
    ├── task.js           # Task class, localStorage CRUD, repeat logic
    ├── tags.js           # TagStore — global tag management and filtering
    └── calendar.js       # Calendar class — grid, date selection, events
```

---

## Data Model

```js
{
  id:           crypto.randomUUID(),
  title:        String,
  type:         "ul" | "ol" | "textarea",
  description:  String,
  body:         [{ text: String, done: Boolean }],
  tags:         String[],
  priority:     "urgent" | "normal",
  dueDate:      "YYYY-MM-DD",
  dateCreated:  String,
  dateModified: String,
  status:       "not done" | "in progress" | "done",
  repeat:       "none" | "daily" | "weekly" | "monthly"
}
```

Storage key: `"notes"` — stored as `{ [id]: note }` in localStorage.

---

## Architecture

The app follows a strict unidirectional data flow:

```
User action → update data (notesStore) → save to localStorage → re-render UI
```

- `notesStore` in `task.js` is the single source of truth
- The DOM is always a reflection of `notesStore`, never the other way around
- Every user edit calls `updateNote()` which persists to localStorage immediately
- `renderHomePage()` and `renderViewNote()` always read from `notesStore`

This architecture was chosen deliberately as a foundation for the planned
migration to a MERN stack — `notesStore` maps directly to a MongoDB collection,
`updateNote()` maps to a `PATCH /notes/:id` endpoint, and the render functions
map to React component re-renders.

---

## Roadmap

### Phase 4 — Polish
- Settings page (display name, theme preferences)
- Tag rename / edit support
- Calendar navigation buttons (prev/next/today)
- Restore last viewed note on page refresh

### Phase 5 — Backend (MERN)
- Express REST API
- MongoDB + Mongoose (1:1 data model mapping)
- JWT authentication
- Multi-device sync

---

## Running Locally

No build step required.

```bash
git clone https://github.com/t00la7y/What-To-Do
cd What-To-Do
```

Open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
# or
python -m http.server
```

> Note: ES6 modules require a server — opening `index.html` directly
> via `file://` will cause CORS errors on the module imports.

---

© 2026 Mpilo Shezi