import { api, clearToken, getToken, saveToken } from './api.js';
import { closeModal, openModal } from './modal.js';
import { showToast } from './toast.js';

const PENDING_KEY = 'yourstore_pending_action';
let currentUser = null;

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getCurrentUser() {
  return currentUser;
}

function setPendingAction(action) {
  if (action) sessionStorage.setItem(PENDING_KEY, JSON.stringify(action));
}

function takePendingAction() {
  const raw = sessionStorage.getItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function requireAuthentication(action) {
  if (isAuthenticated()) return true;
  setPendingAction(action);
  openAuthModal();
  showToast('Please login first.', 'warning');
  return false;
}

export function openAuthModal(action = null, tab = 'login') {
  if (action) setPendingAction(action);
  switchTab(tab);
  openModal('auth-modal');
}

function switchTab(tab) {
  const login = document.getElementById('login-form');
  const register = document.getElementById('register-form');
  if (!login || !register) return;
  const loginActive = tab === 'login';
  login.classList.toggle('hidden', !loginActive);
  register.classList.toggle('hidden', loginActive);
  document.querySelectorAll('[data-auth-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.authTab === tab));
  document.getElementById('auth-title').textContent = loginActive ? 'Welcome Back' : 'Create Your Account';
  document.getElementById('auth-subtitle').textContent = loginActive ? 'Sign in to continue your shopping journey.' : 'Register once and keep your cart, wishlist and orders together.';
}

function updateAccountUI() {
  document.querySelectorAll('[data-account-label]').forEach((element) => {
    element.textContent = currentUser ? currentUser.name.split(' ')[0] : 'Account';
  });
}

async function finishAuth(payload, remember, successMessage) {
  saveToken(payload.token, remember);
  currentUser = payload.user;
  updateAccountUI();
  closeModal('auth-modal');
  showToast(successMessage);
  document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: currentUser } }));
  const pending = takePendingAction();
  if (pending) document.dispatchEvent(new CustomEvent('auth:pending-action', { detail: pending }));
}

export async function syncAuth() {
  if (!isAuthenticated()) {
    currentUser = null;
    updateAccountUI();
    return null;
  }
  try {
    const { user } = await api.get('/auth/me');
    currentUser = user;
  } catch {
    clearToken();
    currentUser = null;
  }
  updateAccountUI();
  return currentUser;
}

export function logout(redirect = false) {
  clearToken();
  currentUser = null;
  sessionStorage.removeItem(PENDING_KEY);
  updateAccountUI();
  document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: null } }));
  showToast('You have been logged out.');
  if (redirect) location.href = 'index.html';
}

export function initAuth() {
  document.querySelectorAll('[data-auth-tab]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.authTab)));
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-auth]');
    if (!button) return;
    if (isAuthenticated()) location.href = 'account.html';
    else openAuthModal();
  });

  document.getElementById('forgot-password')?.addEventListener('click', () => showToast('Password recovery is a UI placeholder in this starter. Connect an email provider before production.', 'warning'));

  document.getElementById('login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = event.currentTarget.querySelector('.form-message');
    message.textContent = '';
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const payload = await api.post('/auth/login', { email: form.get('email'), password: form.get('password') });
      await finishAuth(payload, form.get('remember') === 'on', 'Login successful.');
      event.currentTarget.reset();
    } catch (error) {
      message.textContent = error.message;
    } finally { submit.disabled = false; }
  });

  document.getElementById('register-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = event.currentTarget.querySelector('.form-message');
    message.textContent = '';
    if (form.get('password') !== form.get('confirmPassword')) {
      message.textContent = 'Passwords do not match.';
      return;
    }
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const payload = await api.post('/auth/register', { name: form.get('name'), email: form.get('email'), password: form.get('password') });
      await finishAuth(payload, true, 'Account created successfully.');
      event.currentTarget.reset();
    } catch (error) {
      message.textContent = error.message;
    } finally { submit.disabled = false; }
  });

  document.addEventListener('auth:session-expired', () => {
    currentUser = null;
    updateAccountUI();
    showToast('Your session has expired. Please login again.', 'warning');
    openAuthModal();
  });
}
