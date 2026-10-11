const API_BASE = 'http://localhost:3000';
const AUTH_API = `${API_BASE}/api/auth`;

// If already signed in, skip this page entirely.
redirectIfAuthed();

const form          = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authBtn       = document.getElementById('auth-btn');
const statusEl      = document.getElementById('status');
const tabs          = document.querySelectorAll('.tab');

let mode = 'login';   // 'login' or 'signup'

function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.hidden = false;
}

function setMode(next) {
    mode = next;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === next));
    authBtn.textContent = next === 'login' ? 'Sign in' : 'Create account';
    passwordInput.autocomplete = next === 'login' ? 'current-password' : 'new-password';
    statusEl.hidden = true;
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (!username || !password) return;

    authBtn.disabled = true;
    authBtn.textContent = mode === 'login' ? 'Signing in…' : 'Creating account…';

    try {
    const res = await fetch(`${AUTH_API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        showStatus(data.detail || (mode === 'login' ? 'Sign in failed.' : 'Sign up failed.'), 'error');
        return;
    }

    setAuth(data.access_token, data.user);
    window.location.href = 'index.html';
    } catch (err) {
    console.error(err);
    showStatus('Cannot reach the server.', 'error');
    } finally {
    authBtn.disabled = false;
    authBtn.textContent = mode === 'login' ? 'Sign in' : 'Create account';
    }
});