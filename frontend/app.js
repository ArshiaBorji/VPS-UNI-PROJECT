const API_BASE = 'http://localhost:3000';
const API = `${API_BASE}/api/items`;

// Kick unauthenticated visitors back to the login page.
requireAuth();

// --- DOM refs ---
const form      = document.getElementById('item-form');
const nameInput = document.getElementById('name');
const descInput = document.getElementById('description');
const submitBtn = document.getElementById('submit-btn');
const listEl    = document.getElementById('item-list');
const statusEl  = document.getElementById('status');
const whoEl     = document.getElementById('who');
const logoutBtn = document.getElementById('logout-btn');

// Show the signed-in username in the header.
const me = getUser();
if (me) whoEl.textContent = me.username;

// --- Helpers ---
function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.hidden = false;
}

function clearStatus() {
    statusEl.hidden = true;
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Wrap fetch so every call carries the bearer token, and any 401 sends
// the user back to the login page.
async function apiFetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
    clearAuth();
    window.location.href = 'login.html';
    throw new Error('Unauthorized');
    }
    return res;
}

// --- API calls ---
async function fetchItems() {
    const res = await apiFetch(API);
    if (!res.ok) throw new Error(`GET ${API} failed: ${res.status}`);
    return res.json();
}

async function createItem(payload) {
    const res = await apiFetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`POST ${API} failed: ${res.status}`);
    return res.json();
}

async function deleteItem(id) {
    const res = await apiFetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error(`DELETE failed: ${res.status}`);
}

// --- Rendering ---
function renderItems(items) {
    if (!items.length) {
    listEl.innerHTML = '<li class="empty">No items yet. Add one above.</li>';
    return;
    }
    listEl.innerHTML = items.map(item => `
    <li class="item" data-id="${escapeHtml(item.id)}">
        <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description || '')}</p>
        </div>
        <button class="delete" title="Delete" aria-label="Delete">✕</button>
    </li>
    `).join('');
}

async function loadItems() {
    try {
    clearStatus();
    const items = await fetchItems();
    renderItems(items);
    } catch (err) {
    console.error(err);
    showStatus('Could not load items.', 'error');
    listEl.innerHTML = '';
    }
}

// --- Events ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    if (!name) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding…';

    try {
    await createItem({ name, description });
    form.reset();
    nameInput.focus();
    await loadItems();
    } catch (err) {
    console.error(err);
    showStatus('Failed to create item.', 'error');
    } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add item';
    }
});

listEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete');
    if (!btn) return;

    const li = btn.closest('.item');
    const id = li.dataset.id;

    btn.disabled = true;
    try {
    await deleteItem(id);
    li.remove();
    if (!listEl.children.length) renderItems([]);
    } catch (err) {
    console.error(err);
    showStatus('Failed to delete item.', 'error');
    btn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    clearAuth();
    window.location.href = 'login.html';
});

// --- Init ---
loadItems();