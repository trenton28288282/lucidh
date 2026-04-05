const container = document.getElementById('announcements-container');
const refreshBtn = document.getElementById('refresh-btn');
const themeToggle = document.getElementById('theme-toggle');

function setLoading() {
  container.innerHTML = '<div class="loading"><span class="spinner" aria-hidden="true"></span>Loading announcements…</div>';
  container.parentElement.setAttribute('aria-busy', 'true');
}

function setError() {
  container.innerHTML = '<div class="loading">Unable to load announcements. Edit announcements.html and try again.</div>';
  container.parentElement.setAttribute('aria-busy', 'false');
}

// load announcements.html and insert its HTML into the container with a fade-in
async function loadAnnouncements() {
  setLoading();
  try {
    const res = await fetch('announcements.html', {cache: 'no-store'});
    if (!res.ok) throw new Error('Failed to load announcements');
    const html = await res.text();
    container.innerHTML = html;
    // mark not busy for screen readers
    container.parentElement.setAttribute('aria-busy', 'false');
  } catch (err) {
    console.error(err);
    setError();
  }
}

// refresh button
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    loadAnnouncements();
    refreshBtn.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:600});
  });
}

// Theme handling
const THEME_KEY = 'xylo-theme'; // 'dark' | 'light' | undefined

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('dark');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
  }
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  // fall back to system preference
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

if (themeToggle) {
  // set initial
  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
    themeToggle.animate([{transform:'scale(1)'},{transform:'scale(0.96)'},{transform:'scale(1)'}],{duration:220});
  });
} else {
  // still apply preference if toggle missing
  applyTheme(getPreferredTheme());
}

// initial load
loadAnnouncements();

/* --- Modal: Join our discord --- */
const MODAL_ID = 'discord-modal';
const modal = document.getElementById(MODAL_ID);
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const copyBtn = document.getElementById('copy-discord');
const invite = 'https://discord.gg/AEP6aAnJ';

function showModal() {
  if (!modal) return;
  modal.hidden = false;
  // trap focus simplistically by focusing first actionable item
  const first = modal.querySelector('.btn, button');
  if (first) first.focus();
}

function hideModal() {
  if (!modal) return;
  modal.hidden = true;
}

// attach handlers
if (modalClose) modalClose.addEventListener('click', hideModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', hideModal);
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(invite);
      copyBtn.textContent = 'Copied!';
      copyBtn.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:200});
      setTimeout(()=>{ copyBtn.textContent = 'Copy Invite'; }, 1500);
    } catch (e) {
      console.error('Copy failed', e);
      copyBtn.textContent = 'Copy failed';
      setTimeout(()=>{ copyBtn.textContent = 'Copy Invite'; }, 1500);
    }
  });
}

// show on first load (or until dismissed); simple session guard
if (!sessionStorage.getItem('discordModalDismissed')) {
  // small delay to let page render
  window.addEventListener('load', () => {
    setTimeout(showModal, 320);
  });
}

// when user explicitly closes, remember for this session
if (modalClose || modalBackdrop) {
  const rememberClose = () => sessionStorage.setItem('discordModalDismissed', '1');
  if (modalClose) modalClose.addEventListener('click', rememberClose);
  if (modalBackdrop) modalBackdrop.addEventListener('click', rememberClose);
}