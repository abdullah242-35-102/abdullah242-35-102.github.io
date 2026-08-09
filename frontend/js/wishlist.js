import { api } from './api.js';
import { isAuthenticated, requireAuthentication } from './auth.js';
import { showToast } from './toast.js';

let wishlist = [];

function updateBadge() {
  document.querySelectorAll('[data-wishlist-count]').forEach((badge) => { badge.textContent = wishlist.length; });
  document.querySelectorAll('[data-action="wishlist"]').forEach((button) => {
    const active = wishlist.some((product) => product.id === Number(button.dataset.productId));
    button.classList.toggle('is-active', active);
    if (button.classList.contains('wishlist-btn')) button.textContent = active ? '♥' : '♡';
  });
}

export async function fetchWishlist() {
  if (!isAuthenticated()) { wishlist = []; updateBadge(); return wishlist; }
  try { ({ products: wishlist } = await api.get('/wishlist')); updateBadge(); }
  catch (error) { if (error.status !== 401) showToast(error.message, 'error'); }
  return wishlist;
}

export async function toggleWishlist(productId) {
  productId = Number(productId);
  if (!requireAuthentication({ type: 'wishlist', productId })) return;
  const exists = wishlist.some((product) => product.id === productId);
  try {
    const payload = exists ? await api.delete(`/wishlist/${productId}`) : await api.post('/wishlist', { productId });
    wishlist = payload.products; updateBadge(); showToast('Wishlist updated.');
    document.dispatchEvent(new CustomEvent('wishlist:updated', { detail: wishlist }));
  } catch (error) { showToast(error.message, 'error'); }
}

export function initWishlist() {
  document.addEventListener('auth:changed', fetchWishlist);
  document.addEventListener('auth:pending-action', (event) => { if (event.detail.type === 'wishlist') toggleWishlist(event.detail.productId); });
  document.addEventListener('products:rendered', updateBadge);
  fetchWishlist();
}

export function getWishlist() { return wishlist; }
