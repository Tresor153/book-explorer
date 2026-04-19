/**
 * Book Explorer — app.js
 * Vanilla JS · Open Library API · localStorage
 */

/* ─── State ─── */
const state = {
  currentView: 'search',
  currentTab: 'reading',
  readingList: JSON.parse(localStorage.getItem('readingList') || '[]'),
  lastQuery: '',
};

/* ─── DOM refs ─── */
const $ = id => document.getElementById(id);
const bookGrid       = $('book-grid');
const skeletonGrid   = $('skeleton-grid');
const searchInput    = $('search-input');
const resultsHeader  = $('results-header');
const resultsTitle   = $('results-title');
const resultsCount   = $('results-count');
const emptyState     = $('empty-state');
const modalOverlay   = $('modal-overlay');
const modalContent   = $('modal-content');
const listCount      = $('list-count');
const toast          = $('toast');
let toastTimer;

/* ─── Init ─── */
updateBadge();
renderSkeletons();

/* ─── Event Listeners ─── */
$('search-btn').addEventListener('click', triggerSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(); });

document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    searchInput.value = pill.dataset.q;
    triggerSearch();
  });
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchView(btn.dataset.view);
  });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentTab = btn.dataset.status;
    renderReadingList();
  });
});

$('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
$('theme-toggle').addEventListener('click', toggleTheme);

/* ─── View Switching ─── */
function switchView(view) {
  state.currentView = view;
  $('view-search').classList.toggle('hidden', view !== 'search');
  $('view-reading').classList.toggle('hidden', view !== 'reading');
  bookGrid.classList.toggle('hidden', view !== 'search');
  resultsHeader.classList.toggle('hidden', view !== 'search' || !state.lastQuery);
  emptyState.classList.add('hidden');

  if (view === 'reading') renderReadingList();
}

/* ─── Search ─── */
async function triggerSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  state.lastQuery = q;

  showSkeletons();
  bookGrid.innerHTML = '';
  emptyState.classList.add('hidden');

  try {
    const data = await fetchBooks(q);
    hideSkeletons();

    if (!data.docs || data.docs.length === 0) {
      emptyState.classList.remove('hidden');
      resultsHeader.classList.add('hidden');
      return;
    }

    resultsTitle.textContent = `Ergebnisse für „${q}"`;
    resultsCount.textContent = `${Math.min(data.numFound, data.docs.length)} Bücher`;
    resultsHeader.classList.remove('hidden');

    data.docs.slice(0, 24).forEach(book => {
      bookGrid.appendChild(createBookCard(book));
    });
  } catch (err) {
    hideSkeletons();
    showToast('Fehler beim Laden. Bitte nochmal versuchen.');
    console.error(err);
  }
}

async function fetchBooks(query) {
  const encoded = encodeURIComponent(query);
  const res = await fetch(`https://openlibrary.org/search.json?q=${encoded}&limit=24&fields=key,title,author_name,first_publish_year,cover_i,subject,number_of_pages_median,isbn`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

/* ─── Book Card ─── */
function createBookCard(book, inList = false) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.dataset.key = book.key;

  const coverId = book.cover_i;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;

  const title  = book.title || 'Unbekannter Titel';
  const author = book.author_name ? book.author_name[0] : 'Unbekannter Autor';
  const year   = book.first_publish_year || '';
  const status = getStatus(book.key);

  card.innerHTML = `
    <div class="book-cover">
      ${coverUrl
        ? `<img src="${coverUrl}" alt="${escHtml(title)}" loading="lazy" />`
        : `<div class="cover-placeholder"><span class="icon">📘</span><span>${escHtml(title)}</span></div>`
      }
      ${status ? `<span class="status-badge status-${status}">${statusLabel(status)}</span>` : ''}
    </div>
    <div class="book-info">
      <div class="book-title">${escHtml(title)}</div>
      <div class="book-author">${escHtml(author)}</div>
      ${year ? `<div class="book-year">${year}</div>` : ''}
    </div>`;

  card.addEventListener('click', () => openModal(book));
  return card;
}

/* ─── Modal ─── */
async function openModal(book) {
  const coverId  = book.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
  const title    = book.title || 'Unbekannter Titel';
  const author   = book.author_name ? book.author_name.join(', ') : 'Unbekannt';
  const year     = book.first_publish_year || '';
  const olKey    = book.key?.replace('/works/', '');
  const olUrl    = olKey ? `https://openlibrary.org/works/${olKey}` : 'https://openlibrary.org';
  const status   = getStatus(book.key);

  modalContent.innerHTML = `
    <div class="modal-cover-row">
      <div class="modal-cover">
        ${coverUrl
          ? `<img src="${coverUrl}" alt="${escHtml(title)}" />`
          : `<div class="cover-placeholder"><span class="icon">📘</span></div>`}
      </div>
      <div class="modal-meta">
        <div class="modal-title">${escHtml(title)}</div>
        <div class="modal-author">${escHtml(author)}</div>
        ${year ? `<div class="modal-year">Erstveröffentlicht ${year}</div>` : ''}
        <div id="modal-desc-loading" style="font-size:13px;color:var(--text-faint)">Lade Beschreibung …</div>
      </div>
    </div>
    <div class="modal-desc hidden" id="modal-desc-text"></div>
    <div class="modal-actions">
      <button class="action-btn ${status === 'reading' ? 'selected' : ''}" data-s="reading">📖 Am Lesen</button>
      <button class="action-btn ${status === 'want' ? 'selected' : ''}" data-s="want">🔖 Möchte lesen</button>
      <button class="action-btn ${status === 'done' ? 'selected' : ''}" data-s="done">✅ Gelesen</button>
      <div class="action-ol"><a href="${olUrl}" target="_blank">Auf Open Library ansehen →</a></div>
    </div>`;

  modalContent.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleStatus(book, btn.dataset.s);
      modalContent.querySelectorAll('.action-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.s === getStatus(book.key));
      });
    });
  });

  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Fetch description async
  if (olKey) {
    try {
      const res  = await fetch(`https://openlibrary.org/works/${olKey}.json`);
      const data = await res.json();
      const desc = typeof data.description === 'string'
        ? data.description
        : data.description?.value || '';
      const descEl = $('modal-desc-text');
      const loadEl = $('modal-desc-loading');
      if (desc) {
        descEl.textContent = desc.length > 600 ? desc.slice(0, 600) + '…' : desc;
        descEl.classList.remove('hidden');
      }
      loadEl?.remove();
    } catch {
      $('modal-desc-loading')?.remove();
    }
  } else {
    $('modal-desc-loading')?.remove();
  }
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ─── Reading List ─── */
function renderReadingList() {
  const list = $('reading-list');
  const empty = $('reading-empty');
  const filtered = state.readingList.filter(b => b.status === state.currentTab);

  list.innerHTML = '';
  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    list.classList.add('hidden');
  } else {
    empty.classList.add('hidden');
    list.classList.remove('hidden');
    filtered.forEach(b => list.appendChild(createBookCard(b, true)));
  }
}

function toggleStatus(book, newStatus) {
  const existing = state.readingList.find(b => b.key === book.key);
  if (existing && existing.status === newStatus) {
    // Remove from list
    state.readingList = state.readingList.filter(b => b.key !== book.key);
    showToast('Aus Leseliste entfernt.');
  } else if (existing) {
    existing.status = newStatus;
    showToast(`Status geändert: ${statusLabel(newStatus)}`);
  } else {
    state.readingList.push({ ...book, status: newStatus });
    showToast(`Hinzugefügt: ${statusLabel(newStatus)}`);
  }
  saveList();
  updateBadge();
  refreshCurrentCards(book.key);
}

function saveList() {
  localStorage.setItem('readingList', JSON.stringify(state.readingList));
}

function updateBadge() {
  listCount.textContent = state.readingList.length;
  listCount.style.display = state.readingList.length ? '' : 'none';
}

function refreshCurrentCards(key) {
  document.querySelectorAll(`.book-card[data-key="${key}"]`).forEach(card => {
    const s = getStatus(key);
    let badge = card.querySelector('.status-badge');
    if (s) {
      if (!badge) {
        badge = document.createElement('span');
        card.querySelector('.book-cover').appendChild(badge);
      }
      badge.className = `status-badge status-${s}`;
      badge.textContent = statusLabel(s);
    } else {
      badge?.remove();
    }
  });
  if (state.currentView === 'reading') renderReadingList();
}

function getStatus(key) {
  return state.readingList.find(b => b.key === key)?.status || null;
}

function statusLabel(s) {
  return { reading: '📖 Lese ich', want: '🔖 Merkliste', done: '✅ Gelesen' }[s] || s;
}

/* ─── Skeleton Loading ─── */
function renderSkeletons() {
  skeletonGrid.innerHTML = Array(8).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skel-cover"></div>
      <div class="skel-body">
        <div class="skel-line"></div>
        <div class="skel-line short"></div>
      </div>
    </div>`).join('');
}

function showSkeletons() {
  skeletonGrid.classList.remove('hidden');
  bookGrid.classList.add('hidden');
}

function hideSkeletons() {
  skeletonGrid.classList.add('hidden');
  bookGrid.classList.remove('hidden');
}

/* ─── Toast ─── */
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2600);
}

/* ─── Theme ─── */
function toggleTheme() {
  const body = document.body;
  const next = body.dataset.theme === 'light' ? 'dark' : 'light';
  body.dataset.theme = next;
  localStorage.setItem('theme', next);
}
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.body.dataset.theme = savedTheme;

/* ─── Helpers ─── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
