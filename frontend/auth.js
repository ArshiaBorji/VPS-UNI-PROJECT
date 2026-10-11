// Small helper module for token storage and auth checks.

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

function redirectIfAuthed() {
    if (getToken()) {
    window.location.href = 'index.html';
    }
}