import { api } from './api.js';
import { isAuthenticated, requireAuthentication } from './auth.js';
import { closeDrawer, openDrawer } from './modal.js';
import { escapeHtml, money } from './products.js';
import { showToast } from './toast.js';

let cart = { items: [], subtotal: 0, shipping: 0, discount: 0, total: 0 };

export function getCartState() { return cart; }

function quantityCount() { return cart.items.reduce((sum, item) => sum + item.quantity, 0); }

function updateCartBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((badge) => { badge.textContent = quantityCount(); });
}

function miniItem(item) {
  return `<div class="drawer-item"><img src="${item.product.image}" alt="${escapeHtml(item.product.name)}"><div><strong>${escapeHtml(item.product.name)}</strong><p>${money(item.product.price)} × ${item.quantity}</p></div><button type="button" data-cart-remove="${item.product.id}">Remove</button></div>`;
}

export function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  if (!body) return;
  if (!isAuthenticated()) {
    body.innerHTML = '<div class="empty-cart"><div class="empty-icon">🛒</div><h2>Login to view your cart</h2><p>Your saved cart is tied to your account.</p><button class="btn btn-primary" type="button" data-open-auth>Login</button></div>';
  } else if (!cart.items.length) {
    body.innerHTML = '<div class="empty-cart"><div class="empty-icon">🛒</div><h2>Your cart is empty.</h2><p>Looks like you haven\'t added anything yet.</p><a class="btn btn-primary" href="shop.html">Start Shopping</a></div>';
  } else body.innerHTML = cart.items.map(miniItem).join('');
  document.getElementById('drawer-subtotal-value').textContent = money(cart.subtotal);
  const checkout = document.getElementById('drawer-checkout');
  checkout.setAttribute('aria-disabled', String(!cart.items.length));
  checkout.href = cart.items.length ? 'checkout.html' : '#';
}

export async function fetchCart() {
  if (!isAuthenticated()) {
    cart = { items: [], subtotal: 0, shipping: 0, discount: 0, total: 0 };
    updateCartBadge(); renderCartDrawer(); renderCartPage();
    return cart;
  }
  try {
    ({ cart } = await api.get('/cart'));
    updateCartBadge(); renderCartDrawer(); renderCartPage();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  } catch (error) {
    if (error.status !== 401) showToast(error.message, 'error');
  }
  return cart;
}

export async function addToCart(productId, quantity = 1, { checkout = false } = {}) {
  const action = { type: checkout ? 'buy-now' : 'cart', productId: Number(productId), quantity: Number(quantity) || 1 };
  if (!requireAuthentication(action)) return false;
  try {
    const payload = await api.post('/cart', { productId: Number(productId), quantity: Number(quantity) || 1 });
    cart = payload.cart;
    updateCartBadge(); renderCartDrawer(); renderCartPage();
    showToast(payload.message || 'Product added to your cart.');
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    if (checkout) location.href = 'checkout.html';
    return true;
  } catch (error) { showToast(error.message, 'error'); return false; }
}

async function updateQuantity(productId, quantity) {
  try {
    ({ cart } = await api.put(`/cart/${productId}`, { quantity }));
    updateCartBadge(); renderCartDrawer(); renderCartPage();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  } catch (error) { showToast(error.message, 'error'); }
}

async function removeItem(productId) {
  try {
    ({ cart } = await api.delete(`/cart/${productId}`));
    updateCartBadge(); renderCartDrawer(); renderCartPage();
    showToast('Item removed from your cart.');
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  } catch (error) { showToast(error.message, 'error'); }
}

function cartItem(item) {
  return `<article class="cart-item"><img src="${item.product.image}" alt="${escapeHtml(item.product.name)}"><div><h3>${escapeHtml(item.product.name)}</h3><p>${escapeHtml(item.product.category)} · ${money(item.product.price)} each</p><div class="cart-item-actions"><div class="qty-control"><button type="button" data-cart-qty="minus" data-product-id="${item.product.id}" aria-label="Decrease quantity">−</button><input value="${item.quantity}" readonly aria-label="Quantity"><button type="button" data-cart-qty="plus" data-product-id="${item.product.id}" aria-label="Increase quantity">+</button></div><button class="remove-link" type="button" data-cart-remove="${item.product.id}">Remove</button></div></div><strong class="item-total">${money(item.lineTotal)}</strong></article>`;
}

export function renderCartPage() {
  const page = document.getElementById('cart-page');
  if (!page) return;
  if (!isAuthenticated()) {
    page.innerHTML = '<div class="empty-cart"><div class="empty-icon">🔒</div><h2>Login to view your cart</h2><p>Your cart is protected by your account.</p><button class="btn btn-primary" type="button" data-open-auth>Login or Register</button></div>';
    return;
  }
  if (!cart.items.length) {
    page.innerHTML = '<div class="empty-cart"><div class="empty-icon">🛒</div><h2>Your cart is empty.</h2><p>Looks like you haven\'t added anything yet.</p><a class="btn btn-primary" href="shop.html">Start Shopping</a></div>';
    return;
  }
  page.innerHTML = `<div class="cart-layout"><div class="cart-list">${cart.items.map(cartItem).join('')}</div><aside class="summary-card"><h2>Order Summary</h2><div class="summary-row"><span>Subtotal</span><strong>${money(cart.subtotal)}</strong></div><div class="summary-row"><span>Shipping</span><strong>${cart.shipping ? money(cart.shipping) : 'Free'}</strong></div><div class="summary-row"><span>Discount</span><strong>${money(cart.discount)}</strong></div><div class="summary-row total"><span>Total</span><strong>${money(cart.total)}</strong></div><a class="btn btn-primary btn-block" href="checkout.html">Proceed to Checkout</a><a class="btn btn-outline btn-block" href="shop.html">Continue Shopping</a></aside></div>`;
}

function renderCheckoutSummary() {
  const summary = document.getElementById('checkout-summary');
  if (!summary) return;
  summary.innerHTML = `<div class="mini-order-list">${cart.items.map((item) => `<div class="mini-order-item"><img src="${item.product.image}" alt=""><div><strong>${escapeHtml(item.product.name)}</strong><span>Qty ${item.quantity}</span></div><strong>${money(item.lineTotal)}</strong></div>`).join('')}</div><div class="summary-row"><span>Subtotal</span><strong>${money(cart.subtotal)}</strong></div><div class="summary-row"><span>Shipping</span><strong>${cart.shipping ? money(cart.shipping) : 'Free'}</strong></div><div class="summary-row total"><span>Total</span><strong>${money(cart.total)}</strong></div>`;
}

export async function initCheckout() {
  const page = document.getElementById('checkout-page');
  if (!page) return;
  if (!isAuthenticated()) {
    requireAuthentication({ type: 'checkout' });
    page.innerHTML = '<div class="empty-state"><h2>Login required</h2><p>Please login to continue to checkout.</p></div>';
    return;
  }
  await fetchCart();
  if (!cart.items.length) {
    page.innerHTML = '<div class="empty-cart"><div class="empty-icon">🛒</div><h2>Your cart is empty.</h2><p>Add products before starting checkout.</p><a class="btn btn-primary" href="shop.html">Start Shopping</a></div>';
    return;
  }
  page.innerHTML = `<div class="checkout-layout"><form id="checkout-form" class="checkout-form"><section class="form-card"><h2>Contact & Shipping Address</h2><div class="form-grid"><div class="field full"><label for="fullName">Full name</label><input id="fullName" name="fullName" required autocomplete="name"></div><div class="field full"><label for="address">Street address</label><input id="address" name="address" required autocomplete="street-address"></div><div class="field"><label for="city">City</label><input id="city" name="city" required autocomplete="address-level2"></div><div class="field"><label for="postalCode">Postal code</label><input id="postalCode" name="postalCode" required autocomplete="postal-code"></div><div class="field"><label for="country">Country</label><input id="country" name="country" required autocomplete="country-name"></div><div class="field"><label for="phone">Phone</label><input id="phone" name="phone" required autocomplete="tel"></div></div></section><section class="form-card"><h2>Billing Address</h2><label class="payment-option"><input type="checkbox" checked id="same-billing"> Same as shipping address</label><div class="form-grid hidden" id="billing-fields" style="margin-top:16px"><div class="field full"><label for="billingFullName">Full name</label><input id="billingFullName" name="billingFullName" autocomplete="billing name"></div><div class="field full"><label for="billingAddress">Street address</label><input id="billingAddress" name="billingAddress" autocomplete="billing street-address"></div><div class="field"><label for="billingCity">City</label><input id="billingCity" name="billingCity" autocomplete="billing address-level2"></div><div class="field"><label for="billingPostalCode">Postal code</label><input id="billingPostalCode" name="billingPostalCode" autocomplete="billing postal-code"></div><div class="field"><label for="billingCountry">Country</label><input id="billingCountry" name="billingCountry" autocomplete="billing country-name"></div><div class="field"><label for="billingPhone">Phone</label><input id="billingPhone" name="billingPhone" autocomplete="billing tel"></div></div></section><section class="form-card"><h2>Payment Method</h2><div class="payment-options"><label class="payment-option"><input type="radio" name="paymentMethod" value="card" checked> Credit / Debit Card <small>(demo)</small></label><label class="payment-option"><input type="radio" name="paymentMethod" value="cod"> Cash on Delivery</label><label class="payment-option"><input type="radio" name="paymentMethod" value="paypal"> PayPal <small>(demo)</small></label></div></section><button class="btn btn-primary btn-lg btn-block" type="submit">Place Order</button></form><aside class="summary-card"><h2>Order Summary</h2><div id="checkout-summary"></div></aside></div>`;
  renderCheckoutSummary();
  const sameBilling = document.getElementById('same-billing');
  const billingFields = document.getElementById('billing-fields');
  sameBilling.addEventListener('change', () => {
    billingFields.classList.toggle('hidden', sameBilling.checked);
    billingFields.querySelectorAll('input').forEach((input) => { input.required = !sameBilling.checked; });
  });
  document.getElementById('checkout-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submit = event.currentTarget.querySelector('button[type="submit"]'); submit.disabled = true;
    try {
      const shippingAddress = { fullName: form.get('fullName'), address: form.get('address'), city: form.get('city'), postalCode: form.get('postalCode'), country: form.get('country'), phone: form.get('phone') };
      const billingAddress = sameBilling.checked ? shippingAddress : { fullName: form.get('billingFullName'), address: form.get('billingAddress'), city: form.get('billingCity'), postalCode: form.get('billingPostalCode'), country: form.get('billingCountry'), phone: form.get('billingPhone') };
      const payload = await api.post('/orders', { shippingAddress, billingAddress, paymentMethod: form.get('paymentMethod') });
      cart = { items: [], subtotal: 0, shipping: 0, discount: 0, total: 0 }; updateCartBadge(); renderCartDrawer();
      showToast(`Order ${payload.order.id} placed successfully.`);
      setTimeout(() => { location.href = 'account.html?tab=orders'; }, 500);
    } catch (error) { showToast(error.message, 'error'); submit.disabled = false; }
  });
}

export function initCart() {
  document.querySelectorAll('[data-open-cart]').forEach((button) => button.addEventListener('click', async () => { if (isAuthenticated()) await fetchCart(); openDrawer('cart-drawer'); }));
  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-cart-remove]'); if (remove) removeItem(Number(remove.dataset.cartRemove));
    const qty = event.target.closest('[data-cart-qty]'); if (qty) {
      const item = cart.items.find((entry) => entry.product.id === Number(qty.dataset.productId));
      if (!item) return;
      const next = item.quantity + (qty.dataset.cartQty === 'plus' ? 1 : -1);
      if (next >= 1) updateQuantity(item.product.id, next);
    }
  });
  document.addEventListener('auth:changed', () => fetchCart());
  document.addEventListener('auth:pending-action', (event) => {
    const action = event.detail;
    if (action.type === 'cart') addToCart(action.productId, action.quantity);
    if (action.type === 'buy-now') addToCart(action.productId, action.quantity, { checkout: true });
    if (action.type === 'checkout') location.href = 'checkout.html';
  });
  fetchCart();
}
