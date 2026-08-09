import { api } from './api.js';
import { getCurrentUser, initAuth, isAuthenticated, logout, openAuthModal, syncAuth } from './auth.js';
import { addToCart, fetchCart, getCartState, initCart, initCheckout } from './cart.js';
import { initModalControls, openModal, openDrawer, closeDrawer } from './modal.js';
import { escapeHtml, getProduct, getProducts, money, renderHomeProducts, renderProductDetail } from './products.js';
import { initHeaderSearch, initShop } from './search.js';
import { initSlider } from './slider.js';
import { showToast } from './toast.js';
import { fetchWishlist, getWishlist, initWishlist, toggleWishlist } from './wishlist.js';

function injectLayout() {
  const page = document.body.dataset.page;
  const nav = [
    ['Home', 'index.html', 'home'], ['Shop', 'shop.html', 'shop'], ['Categories', 'shop.html', 'categories'], ['Deals', 'index.html#deals', 'deals'], ['New Arrivals', 'shop.html?sort=newest', 'new'], ['Best Sellers', 'shop.html?sort=popular', 'best']
  ];
  document.getElementById('site-top').innerHTML = `
    <div class="announcement"><div class="container"><span>Free shipping on orders over $50 &nbsp;|&nbsp; Easy 30-Day Returns</span><div class="announcement-links"><a href="#">Help</a><a href="account.html?tab=orders">Track Order</a><a href="#footer">Support</a></div></div></div>
    <header class="site-header" id="site-header"><div class="container header-inner">
      <a class="logo" href="index.html" aria-label="YourStore home"><span class="logo-mark">Y</span>YourStore</a>
      <nav class="main-nav" aria-label="Main navigation"><ul>${nav.map(([label, href, key]) => `<li><a class="${page === key ? 'active' : ''}" href="${href}">${label}</a></li>`).join('')}</ul></nav>
      <form class="header-search" id="global-search-form" role="search"><label class="sr-only" for="global-search">Search products</label><input id="global-search" type="search" placeholder="Search products, categories…" autocomplete="off"><button type="submit" aria-label="Search">⌕</button><div class="search-suggestions hidden" id="search-suggestions"></div></form>
      <div class="header-actions"><button class="icon-btn hamburger" type="button" data-open-mobile aria-label="Open menu">☰</button><button class="icon-btn search-mobile" type="button" data-mobile-search aria-label="Search">⌕</button><button class="icon-btn" type="button" data-open-auth aria-label="Account">♙<span class="sr-only account-label" data-account-label>Account</span></button><a class="icon-btn wishlist-header" href="account.html?tab=wishlist" aria-label="Wishlist">♡<span class="badge" data-wishlist-count>0</span></a><button class="icon-btn" type="button" data-open-cart aria-label="Shopping cart">🛒<span class="badge" data-cart-count>0</span></button></div>
    </div></header>
    <div class="drawer-overlay" data-overlay-for="mobile-drawer"></div><aside class="side-drawer left" id="mobile-drawer" aria-label="Mobile navigation"><div class="drawer-head"><a class="logo" href="index.html"><span class="logo-mark">Y</span>YourStore</a><button class="drawer-close" type="button" data-close-drawer="mobile-drawer">×</button></div><div class="drawer-body"><form id="mobile-search-form" class="header-search" style="display:block"><input id="mobile-search-input" type="search" placeholder="Search products…"><button type="submit">⌕</button></form><nav class="mobile-nav-list">${nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</nav><div class="mobile-nav-meta"><button type="button" data-open-auth>Account</button><a href="account.html?tab=wishlist">Wishlist</a><button type="button" data-open-cart>Cart</button></div></div></aside>
    <div class="drawer-overlay" data-overlay-for="cart-drawer"></div><aside class="side-drawer" id="cart-drawer" aria-label="Shopping cart drawer"><div class="drawer-head"><h2>Your Cart</h2><button class="drawer-close" type="button" data-close-drawer="cart-drawer">×</button></div><div class="drawer-body" id="cart-drawer-body"></div><div class="drawer-footer"><div class="drawer-subtotal"><span>Subtotal</span><span id="drawer-subtotal-value">$0.00</span></div><div class="drawer-actions"><a class="btn btn-outline" href="cart.html">View Cart</a><a class="btn btn-primary" href="checkout.html" id="drawer-checkout">Checkout</a></div></div></aside>
    <div class="modal-overlay" data-overlay-for="auth-modal"></div><div class="modal-shell" id="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div class="modal-card"><div class="modal-head"><div><h2 id="auth-title">Welcome Back</h2><p id="auth-subtitle">Sign in to continue your shopping journey.</p></div><button class="drawer-close" type="button" data-close-modal="auth-modal" aria-label="Close">×</button></div><div class="modal-body"><div class="auth-tabs"><button class="is-active" type="button" data-auth-tab="login">Login</button><button type="button" data-auth-tab="register">Register</button></div><form id="login-form" class="auth-form" novalidate><div class="field"><label for="login-email">Email</label><input id="login-email" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required></div><div class="auth-meta"><label><input type="checkbox" name="remember"> Remember me</label><button id="forgot-password" type="button">Forgot Password?</button></div><div class="form-message" aria-live="polite"></div><button class="btn btn-primary btn-block" type="submit">Login</button></form><form id="register-form" class="auth-form hidden" novalidate><div class="field"><label for="register-name">Full name</label><input id="register-name" name="name" autocomplete="name" minlength="2" required></div><div class="field"><label for="register-email">Email</label><input id="register-email" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="register-password">Password</label><input id="register-password" name="password" type="password" autocomplete="new-password" minlength="8" required></div><div class="field"><label for="register-confirm">Confirm password</label><input id="register-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></div><div class="form-message" aria-live="polite"></div><button class="btn btn-primary btn-block" type="submit">Create Account</button></form></div></div></div>
    <div class="modal-overlay" data-overlay-for="quick-modal"></div><div class="modal-shell" id="quick-modal" role="dialog" aria-modal="true" aria-labelledby="quick-title"><div class="modal-card" style="width:min(640px,100%)"><div class="modal-head"><div><h2 id="quick-title">Quick View</h2></div><button class="drawer-close" type="button" data-close-modal="quick-modal">×</button></div><div class="modal-body" id="quick-modal-body"></div></div></div>`;

  document.getElementById('site-bottom').innerHTML = `<footer class="site-footer" id="footer"><div class="container footer-grid"><div class="footer-brand"><a class="logo" href="index.html" style="color:white"><span class="logo-mark">Y</span>YourStore</a><p>Modern essentials, transparent pricing and an account-based shopping experience built for speed and simplicity.</p><div class="payment-row"><span class="payment-chip">VISA</span><span class="payment-chip">Mastercard</span><span class="payment-chip">PayPal</span><span class="payment-chip">Apple Pay</span><span class="payment-chip">Google Pay</span></div></div><div class="footer-col"><h3>Company</h3><a href="#">About Us</a><a href="#">Careers</a><a href="#">Blog</a><a href="#">Contact</a></div><div class="footer-col"><h3>Customer Service</h3><a href="#">Help Center</a><a href="#">Shipping</a><a href="#">Returns</a><a href="account.html?tab=orders">Track Order</a></div><div class="footer-col"><h3>Information</h3><a href="#">Privacy Policy</a><a href="#">Terms & Conditions</a><a href="#">Refund Policy</a></div><div class="footer-col"><h3>Follow Us</h3><div class="social-links"><a href="#">Facebook</a><a href="#">Instagram</a><a href="#">X</a><a href="#">YouTube</a><a href="#">LinkedIn</a></div></div></div><div class="container footer-bottom"><span>© 2026 YourStore. All Rights Reserved.</span><span>Built with HTML, CSS, Vanilla JavaScript & Express.</span></div></footer>`;
}

function initHeader() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => header.classList.toggle('is-compact', scrollY > 20), { passive: true });
  document.querySelector('[data-open-mobile]')?.addEventListener('click', () => openDrawer('mobile-drawer'));
  document.querySelector('[data-mobile-search]')?.addEventListener('click', () => { openDrawer('mobile-drawer'); setTimeout(() => document.getElementById('mobile-search-input')?.focus(), 100); });
  document.getElementById('mobile-search-form')?.addEventListener('submit', (event) => { event.preventDefault(); const q = document.getElementById('mobile-search-input').value.trim(); if (q) location.href = `shop.html?q=${encodeURIComponent(q)}`; });
}

function initBenefits() {
  const el = document.getElementById('benefits'); if (!el) return;
  const icons = { ship: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>', secure: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/></svg>', returns: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7v5h5"/><path d="M5 12a7 7 0 1 0 2-5"/></svg>', support: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v5h3v-5zM17 13v5h3v-5zM17 20h-5"/></svg>' };
  const items = [[icons.ship,'FREE SHIPPING','Free shipping over $50'],[icons.secure,'SECURE PAYMENT','100% secure payment'],[icons.returns,'EASY RETURNS','30-day return policy'],[icons.support,'24/7 SUPPORT','Dedicated customer support']];
  el.innerHTML = items.map(([icon,title,text]) => `<div class="benefit-card"><span class="benefit-icon">${icon}</span><div><strong>${title}</strong><span>${text}</span></div></div>`).join('');
}

function initCountdown() {
  const el = document.getElementById('deal-countdown'); if (!el) return;
  let end = Number(localStorage.getItem('yourstore_deal_end')) || Date.now() + 13 * 60 * 60 * 1000;
  if (end < Date.now()) { end = Date.now() + 13 * 60 * 60 * 1000; localStorage.setItem('yourstore_deal_end', end); }
  const render = () => { const diff = Math.max(0, end - Date.now()); const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000); el.innerHTML = [['Hours',h],['Minutes',m],['Seconds',s]].map(([label,value]) => `<div class="countdown-unit"><strong>${String(value).padStart(2,'0')}</strong><span>${label}</span></div>`).join(''); };
  render(); setInterval(render, 1000);
}

function initNewsletter() {
  document.getElementById('newsletter-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const input = event.currentTarget.elements.email;
    if (!input.validity.valid) { showToast('Enter a valid email address.', 'error'); input.focus(); return; }
    try { const payload = await api.post('/newsletter', { email: input.value }); showToast(payload.message); event.currentTarget.reset(); }
    catch (error) { showToast(error.message, 'error'); }
  });
}

async function showQuickView(productId) {
  const body = document.getElementById('quick-modal-body');
  body.innerHTML = '<div class="skeleton-block" style="height:220px;border-radius:16px"></div>'; openModal('quick-modal');
  try { const product = await getProduct(productId); body.innerHTML = `<div class="quick-view-grid"><img src="${product.image}" alt="${escapeHtml(product.name)}"><div><span class="product-category">${escapeHtml(product.category)}</span><h3>${escapeHtml(product.name)}</h3><div class="product-rating">★★★★★ <small>${product.rating} (${product.reviews})</small></div><div class="product-price"><strong>${money(product.price)}</strong><del>${money(product.oldPrice)}</del></div><p>${escapeHtml(product.description)}</p><div class="quick-actions"><div class="qty-control"><button type="button" data-quick-qty="minus" data-quick-input="quick-qty-${product.id}">−</button><input id="quick-qty-${product.id}" type="number" min="1" max="${product.stock}" value="1" aria-label="Quantity"><button type="button" data-quick-qty="plus" data-quick-input="quick-qty-${product.id}">+</button></div><button class="btn btn-primary" type="button" data-action="add-cart" data-product-id="${product.id}" data-quantity-source="quick-qty-${product.id}">Add to Cart</button><a class="btn btn-outline" href="product.html?id=${product.id}">Full Details</a></div></div></div>`; }
  catch (error) { body.innerHTML = `<p>${escapeHtml(error.message)}</p>`; }
}

function initGlobalProductActions() {
  document.addEventListener('auth:pending-action', (event) => {
    if (event.detail.type === 'account') location.reload();
  });
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]'); if (!action) return;
    const id = Number(action.dataset.productId);
    const source = action.dataset.quantitySource ? document.getElementById(action.dataset.quantitySource) : null;
    const quantity = source ? Math.max(1, Number(source.value) || 1) : 1;
    if (action.dataset.action === 'add-cart') addToCart(id, quantity);
    if (action.dataset.action === 'buy-now') addToCart(id, quantity, { checkout: true });
    if (action.dataset.action === 'wishlist') toggleWishlist(id);
    if (action.dataset.action === 'quick-view') showQuickView(id);
  });
  document.addEventListener('click', (event) => {
    const qty = event.target.closest('[data-detail-qty],[data-quick-qty]'); if (!qty) return;
    const inputId = qty.dataset.quickInput || 'detail-quantity';
    const input = document.getElementById(inputId); if (!input) return;
    const direction = qty.dataset.detailQty || qty.dataset.quickQty;
    const delta = direction === 'plus' ? 1 : -1; input.value = Math.min(Number(input.max || 99), Math.max(1, Number(input.value) + delta));
  });
}

async function initAccountPage() {
  const page = document.getElementById('account-page'); if (!page) return;
  if (!isAuthenticated()) { openAuthModal({ type: 'account' }); page.innerHTML = '<div class="empty-state"><h2>Login required</h2><p>Sign in to view your dashboard, orders and wishlist.</p></div>'; return; }
  const user = await syncAuth(); if (!user) return;
  await Promise.all([fetchCart(), fetchWishlist()]);
  const orders = (await api.get('/orders')).orders;
  const wishlist = getWishlist();
  page.innerHTML = `<div class="account-shell"><nav class="account-nav" aria-label="Account sections"><button class="is-active" data-account-tab="dashboard">Dashboard</button><button data-account-tab="orders">My Orders</button><button data-account-tab="wishlist">Wishlist</button><button data-account-tab="profile">Profile</button><button data-account-tab="addresses">Addresses</button><button data-account-tab="logout">Logout</button></nav><div class="account-content" id="account-content"></div></div>`;
  const renderTab = async (tab) => {
    document.querySelectorAll('[data-account-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.accountTab === tab));
    const content = document.getElementById('account-content');
    if (tab === 'dashboard') content.innerHTML = `<div class="dashboard-hero"><span class="eyebrow">Welcome back</span><h2>Hello, ${escapeHtml(user.name.split(' ')[0])}</h2><p>Manage your shopping activity from one place.</p></div><div class="account-grid"><div class="stat-card"><strong>${orders.length}</strong><span>Total orders</span></div><div class="stat-card"><strong>${getWishlist().length}</strong><span>Wishlist items</span></div><div class="stat-card"><strong>${getCartState().items.length}</strong><span>Products in cart</span></div></div>`;
    if (tab === 'orders') content.innerHTML = orders.length ? `<h2 style="margin-bottom:16px;color:var(--dark)">My Orders</h2>${orders.map((order) => `<article class="order-card"><div class="order-head"><div><strong>${order.id}</strong><span>${new Date(order.createdAt).toLocaleDateString()}</span></div><strong>${money(order.total)}</strong></div><span class="status-pill">${order.status}</span><p style="margin-top:8px;color:var(--muted);font-size:.82rem">${order.items.length} item(s) · ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.country)}</p></article>`).join('')}` : '<div class="empty-state"><h2>No orders yet</h2><p>Your completed orders will appear here.</p><a class="btn btn-primary" href="shop.html">Start Shopping</a></div>';
    if (tab === 'wishlist') { const latest = getWishlist(); content.innerHTML = latest.length ? `<h2 style="margin-bottom:16px;color:var(--dark)">Wishlist</h2><div class="wishlist-grid">${latest.map((p) => `<article class="product-card"><div class="product-media"><a href="product.html?id=${p.id}"><img src="${p.image}" alt="${escapeHtml(p.name)}"></a></div><div class="product-body"><span class="product-category">${escapeHtml(p.category)}</span><a class="product-name" href="product.html?id=${p.id}">${escapeHtml(p.name)}</a><div class="product-price"><strong>${money(p.price)}</strong></div><div class="product-actions"><button class="btn btn-primary" data-action="add-cart" data-product-id="${p.id}">Add to Cart</button><button class="btn btn-outline" data-action="wishlist" data-product-id="${p.id}">Remove</button></div></div></article>`).join('')}</div>` : '<div class="empty-state"><h2>Your wishlist is empty.</h2><p>Save products you want to revisit later.</p><a class="btn btn-primary" href="shop.html">Browse Products</a></div>'; }
    if (tab === 'profile') content.innerHTML = `<div class="form-card"><h2>Profile</h2><div class="form-grid"><div class="field"><label>Name</label><input value="${escapeHtml(user.name)}" readonly></div><div class="field"><label>Email</label><input value="${escapeHtml(user.email)}" readonly></div><div class="field full"><label>Member since</label><input value="${new Date(user.createdAt).toLocaleDateString()}" readonly></div></div></div>`;
    if (tab === 'addresses') content.innerHTML = '<div class="empty-state"><h2>No saved addresses yet</h2><p>Addresses used at checkout can be connected to a profile address API later without changing the checkout layout.</p></div>';
    if (tab === 'logout') logout(true);
  };
  document.querySelector('.account-nav').addEventListener('click', (event) => { const button = event.target.closest('[data-account-tab]'); if (button) renderTab(button.dataset.accountTab); });
  const requested = new URLSearchParams(location.search).get('tab'); renderTab(['orders','wishlist','profile','addresses'].includes(requested) ? requested : 'dashboard');
  document.addEventListener('wishlist:updated', () => { if (document.querySelector('[data-account-tab="wishlist"]')?.classList.contains('is-active')) renderTab('wishlist'); });
}

async function main() {
  injectLayout(); initModalControls(); initHeader(); initAuth(); initCart(); initWishlist(); initHeaderSearch(); initGlobalProductActions(); initBenefits(); initCountdown(); initNewsletter(); await syncAuth();
  const page = document.body.dataset.page;
  try {
    if (page === 'home') { initSlider(); await renderHomeProducts(); }
    if (page === 'shop') await initShop();
    if (page === 'product') await renderProductDetail();
    if (page === 'cart') await fetchCart();
    if (page === 'checkout') await initCheckout();
    if (page === 'account') await initAccountPage();
  } catch (error) { console.error(error); showToast(error.message || 'Something went wrong.', 'error'); }
}

main();
