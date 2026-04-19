# 📖 Book Explorer

A clean, elegant book discovery and reading tracker web application — built with vanilla JavaScript and the free [Open Library API](https://openlibrary.org/developers/api).

**[→ Live Demo](https://your-username.github.io/book-explorer)**

---

## ✨ Features

- **Instant book search** via Open Library (millions of titles)
- **Quick-access genre pills** for thematic discovery (Homöopathie, Philosophie, Naturheilkunde …)
- **Book detail modal** with cover, description, author, and year
- **Personal reading list** with three statuses: *Am Lesen / Merkliste / Gelesen*
- **Persistent storage** via `localStorage` — your list survives browser restarts
- **Dark / Light mode** toggle with system preference support
- **Skeleton loading** animations for a polished feel
- **Zero dependencies** — no frameworks, no build step, just HTML + CSS + JS

---

## 🚀 Getting Started

### Option A — Open directly in browser

```bash
git clone https://github.com/YOUR_USERNAME/book-explorer.git
cd book-explorer
open index.html          # macOS
# or: xdg-open index.html  # Linux
# or: start index.html      # Windows
```

### Option B — Local dev server (recommended)

```bash
# With Python
python -m http.server 8000

# With Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.

### Option C — Deploy to GitHub Pages (free)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your app is live at `https://YOUR_USERNAME.github.io/book-explorer`

---

## 🗂 Project Structure

```
book-explorer/
├── index.html        # App shell & semantic markup
├── css/
│   └── style.css     # All styles — CSS variables, dark mode, animations
├── js/
│   └── app.js        # All logic — API calls, state, DOM manipulation
└── README.md
```

---

## 🔧 Technical Highlights

| Topic | Implementation |
|---|---|
| API integration | `fetch()` + `async/await` + error handling |
| State management | Plain JS object + `localStorage` for persistence |
| DOM rendering | Vanilla JS template strings, `innerHTML` |
| CSS architecture | Custom properties (variables), BEM-like naming |
| Dark mode | CSS `data-theme` attribute toggle |
| Performance | `loading="lazy"` on images, skeleton loading UX |
| Accessibility | Semantic HTML, `aria-label`, keyboard-friendly |

---

## 📡 API Used

**[Open Library Search API](https://openlibrary.org/dev/docs/api)** — completely free, no API key required.

```
GET https://openlibrary.org/search.json?q={query}&limit=24
GET https://openlibrary.org/works/{key}.json
GET https://covers.openlibrary.org/b/id/{id}-M.jpg
```

---

## 🎨 Design Decisions

- **Editorial typography**: Playfair Display (serif headlines) + DM Sans (body) for a publishing-house aesthetic
- **Nature-inspired palette**: Forest green (`#3D5A3E`) as primary accent — calm, professional
- **Micro-interactions**: Card lift on hover, modal slide-in, toast notifications
- **Mobile-first**: CSS Grid with `auto-fill` + `minmax`, fluid typography with `clamp()`

---

## 🛣 Possible Extensions

- [ ] Pagination / infinite scroll for large result sets
- [ ] Reading progress tracker (pages read / total pages)
- [ ] Book notes & personal ratings
- [ ] Export reading list as CSV or JSON
- [ ] Barcode / ISBN scanner via device camera
- [ ] Backend sync (Supabase, Firebase) for multi-device support

---

## 📄 License

MIT — feel free to use, modify, and build upon this project.

---

*Built as a portfolio project demonstrating REST API integration, clean vanilla JS architecture, and thoughtful UI/UX design.*
