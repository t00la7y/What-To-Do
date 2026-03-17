# What-To-Do — Project Memory File
> Last updated: 16 March 2026 — Session 2 (refactor + popups)

---

## What This App Is

A productivity web app for managing notes and to-do lists. The goal is to start as a vanilla HTML/CSS/JS SPA with localStorage, then migrate to a full MERN stack with microservices architecture later.

**Developer:** Mpilo Shezi (t00la7y)
**Repo:** https://github.com/t00la7y/What-To-Do

---

## App Vision

A single-page application with three core areas:

1. **Carousel** (left panel, 40% width) — vertical scrollable list of all note cards
2. **Display** (right panel, 60% width) — shows whichever page is active:
   - Home page — urgency dashboard + create popup trigger
   - View/Edit page — full note detail, checklist toggling, editing
3. **Desktop Nav** (fixed sidebar, 16rem) — account, navigation, calendar, footer

---

## Note Data Structure

```js
{
  id: crypto.randomUUID(),
  title: "",
  type: "ul" | "ol" | "textarea",
  description: "",   // short summary shown on carousel card
  body: [],          // array of items/lines — the actual note content
  tags: [],
  priority: "urgent" | "normal",
  dueDate: "",
  dateCreated: "",
  dateModified: "",  // auto-updates on every edit
  status: "done" | "in progress" | "not done"
}
```

**Storage:** localStorage hashmap keyed by `id` — O(1) lookup.
**Future:** Direct swap to MongoDB — same schema maps 1:1 to a Mongoose document.

---

## Three Note Types (view-note-detail)

| Type | Create input | View behaviour |
|------|-------------|----------------|
| `ul` | Description textarea | Unordered checklist — toggle done/undone |
| `ol` | Description textarea | Ordered checklist with CSS counters — toggle done/undone |
| `textarea` | Description textarea | Editable plain textarea |

`body[]` storage:
- Lists: each `<li>` text is one array item
- Textarea: `split("\n")` on save, `join("\n")` on render

---

## Pages / Sections

### Home (`.home`)
- **Top:** Create Note popup trigger (not inline — popup like tag manager)
- **Bottom:** Dashboard sections
  - 🔥 Urgent — filtered by `priority === "urgent"`
  - 📅 Due Soon — sorted by `dueDate` ascending, nearest 3–5 cards

### View Note (`.to-do-Note`)
- Header: title + options (⋯)
- Meta: Date Due, Progress, Date Modified, Tags (with × delete per tag)
- Detail: renders based on note `type` — ul checklist / ol checklist / textarea
- All edits update `dateModified` automatically

### Create Note (popup — NOT a separate page)
- Triggered by "New Note" nav item
- Same popup pattern as tag manager (backdrop + centered fixed div)
- Fields: Title, Type selector (List / Ordered / Note), Description, Tags, Priority, Due Date
- Save → adds to localStorage → pushes card to carousel → closes popup

---

## Desktop Nav Structure

```
aside.desktop-nav
  ├── .account-action        (avatar + name + dropdown)
  ├── nav                    (Home, New Note, Tags, Settings)
  ├── .nav-calendar-block    (calendar table — separate from nav list)
  └── footer                 (Mpilo Shezi / © 2026)
```

### Nav Responsive Behaviour (clamp-friendly)

| Viewport | Nav width | Behaviour |
|----------|-----------|-----------|
| ≥ 900px | 16rem | Full — labels + calendar visible |
| 600–899px | 4rem | Mini — icons only, calendar hidden |
| < 600px | hidden | Mobile nav (hamburger) takes over |

Transition is smooth: `transition: width 0.25s ease` on nav, matching transition on `.page`.

---

## CSS File Architecture

| File | Responsibility |
|------|---------------|
| `modal.css` | CSS variables (light + dark mode), base body/html styles |
| `layout.css` | Core layout & SPA scaffolding (page / display / transitions) |
| `nav.css` | Desktop + mobile nav layouts & responsive behavior |
| `home.css` | Home dashboard layout (cards, sections) |
| `carousel.css` | Carousel panel layout + header hide-on-scroll |
| `note.css` | Carousel note card styling |
| `calendar.css` | Calendar table styling |
| `popups.css` | Popup core styles + create-note popup styling |
| `tags.css` | Tag manager list & interaction styling |

**Import chain:** `style.css` imports all others via `@import`.

---

## Animations Completed

- ✅ Carousel header hides on scroll down, reappears on scroll up (Twitter/X pattern)
- ✅ Mobile nav slides in from left (`transform: translateX`) — visibility trick so transition works
- ✅ Hamburger → X animation on open
- ✅ SPA page transitions — fade + translateY between home and view
- ✅ Tag popup — fade + slide in, backdrop click/Escape to close
- ✅ Nav smooth resize transition between full and mini mode

---

## Known Issues / Things To Fix Before JS

- [ ] Duplicate `id` attributes still may exist in carousel cards — convert all to `data-id` + classes
- [ ] `#month` appears twice (desktop nav + mobile nav) — rename mobile one to `id="month-mobile"`
- [ ] `.to-do-Note` has all three note type scenarios visible simultaneously (ul + ol + textarea) — JS will control which one renders based on `note.type`
- [ ] Improve modularity further by moving remaining hardcoded HTML into JS render functions

---

## Roadmap Status

### ✅ Phase 1 — Structure & Styles
- [x] CSS architecture + variables + dark mode variables
- [x] Desktop nav — account, nav items, calendar block, footer
- [x] Carousel layout + cards
- [x] Home page — urgent row + due soon row
- [x] Create note form (needs popup conversion)
- [x] View note page — meta rows, tag pills, checklist, textarea
- [x] Responsive nav (full / mini / mobile)
- [x] Mobile hamburger nav

### ✅ Phase 2 — Animations
- [x] Carousel hide-on-scroll header
- [x] Mobile nav slide animation fix
- [x] SPA page transitions
- [x] Tag popup animation
- [x] Nav resize transition

### 🔲 Phase 2 Remaining (HTML/CSS)
- [x] Convert create form to popup (same pattern as tag popup)
- [ ] Dark mode toggle button (placement TBD — settings or account dropdown)
- [ ] Settings page placeholder content

### 🔲 Phase 3 — JavaScript (localStorage)
- [ ] localStorage data helpers: `getNotes`, `saveNote`, `deleteNote`, `updateNote`
- [ ] Render carousel cards from localStorage data
- [ ] Create popup logic — save to storage, push card to carousel, close popup (✅ popup open/close wired)
- [ ] Click card → load note into view page
- [ ] SPA routing — show/hide home vs view via `.active` class
- [ ] Checklist toggle + persist checked state to localStorage (✅ click toggles done state)
- [ ] Dynamic calendar — generate table from `new Date()` not hardcoded HTML
- [ ] Tag filter — click tag in popup → filter carousel
- [ ] Tag delete — remove from global list + strip from all notes
- [ ] Tag add — press Enter in popup input → add to list + localStorage
- [ ] Dark mode toggle — `body.classList.toggle('dark-mode')` + persist to localStorage
- [ ] Greeting — "Good Morning/Afternoon/Evening" based on time of day
- [ ] `dateModified` auto-update on any note edit
- [ ] Sort methods: `urgentSort()`, `dueDateSort()`, `tagSort()`, `dateSort()`

### 🔲 Phase 4 — Code Quality
- [ ] Fix all remaining duplicate IDs
- [ ] Remove all hardcoded placeholder HTML (replaced by JS rendering)
- [ ] Audit and clean unused CSS rules

### 🔲 Phase 5 — Backend (MERN)
- [ ] Express REST API — replace localStorage calls with `fetch()` to `/api/notes`
- [ ] MongoDB + Mongoose — Note schema matches current JS object structure
- [ ] Auth — JWT, user accounts, protected routes
- [ ] React migration (optional) — CSS variables transfer cleanly

---

## Data Layer Plan

```js
// helpers (will live in js/app.js)
const getNotes = () => JSON.parse(localStorage.getItem('notes')) || {};
const saveNotes = (notes) => localStorage.setItem('notes', JSON.stringify(notes));
const getNote = (id) => getNotes()[id];
const deleteNote = (id) => { const n = getNotes(); delete n[id]; saveNotes(n); };
const updateNote = (id, changes) => {
  const notes = getNotes();
  notes[id] = { ...notes[id], ...changes, dateModified: new Date().toLocaleDateString() };
  saveNotes(notes);
};
const saveNote = (note) => {
  const notes = getNotes();
  notes[note.id] = note;
  saveNotes(notes);
};
```

**Search:** HashMap — `notes[id]` is O(1). No linked list needed for localStorage phase.
**Sort:** Array methods on `Object.values(getNotes())`:
```js
Object.values(getNotes()).filter(n => n.priority === 'urgent')
Object.values(getNotes()).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
```

---

## Dark Mode

Already implemented in `modal.css` as `.dark-mode` class on `<body>`.
JS toggle (two lines):
```js
document.body.classList.toggle('dark-mode');
localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
```
On load:
```js
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
```

---

## File To Create Next Session

`js/app.js` — link in `index.html` just before `</body>`:
```html
<script src="js/app.js"></script>
```
Move all inline script logic into this file and expand from there.

---

## Notes On System Design

- Current architecture is a **monolith** — correct starting point
- Path to microservices: monolith → modular JS files → separate Express routers → independent services
- Each JS module (notes, tags, calendar, auth) maps to a future microservice
- Dijkstra is NOT the right algorithm here — it's pathfinding for graphs, not note search
- HashMap is the right choice for localStorage phase, MongoDB `$text` index for backend phase