import { PRODUCTS } from './data.js';

const LOCAL_TOKEN_KEY = 'yourstore_token';
const SESSION_TOKEN_KEY = 'yourstore_session_token';
const DB_KEY = 'yourstore_static_db_v1';

function emptyDb() {
  return { users: [], carts: {}, wishlists: {}, orders: [], newsletter: [] };
}

function readDb() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? { ...emptyDb(), ...parsed } : emptyDb();
  } catch {
    return emptyDb();
  }
}

function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function publicUser(user) {
  return user ? { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } : null;
}

function makeId(prefix = 'usr') {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
}

async function passwordDigest(value) {
  const text = String(value || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(text)));
}

function makeToken(userId) {
  return `local-demo.${encodeURIComponent(userId)}.${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function tokenUserId(token) {
  if (!token?.startsWith('local-demo.')) return null;
  const part = token.split('.')[1];
  try { return decodeURIComponent(part || ''); } catch { return null; }
}

export function getToken() {
  const token = localStorage.getItem(LOCAL_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;
  const userId = tokenUserId(token);
  const exists = readDb().users.some((user) => user.id === userId);
  if (!userId || !exists) {
    clearToken();
    return null;
  }
  return token;
}

export function saveToken(token, remember = false) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(remember ? LOCAL_TOKEN_KEY : SESSION_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

function error(message, status = 400, code) {
  const err = new Error(message);
  err.status = status;
  if (code) err.code = code;
  throw err;
}

function currentUserRecord() {
  const token = getToken();
  const userId = tokenUserId(token);
  if (!userId) error('Please login to continue.', 401, 'AUTH_REQUIRED');
  const user = readDb().users.find((item) => item.id === userId);
  if (!user) {
    clearToken();
    error('Your session is no longer valid.', 401, 'SESSION_INVALID');
  }
  return user;
}

function productById(id) {
  return PRODUCTS.find((item) => item.id === Number(id));
}

function hydrateCart(entries = []) {
  const items = entries.map((entry) => {
    const product = productById(entry.productId);
    return product ? { product, quantity: entry.quantity, lineTotal: +(product.price * entry.quantity).toFixed(2) } : null;
  }).filter(Boolean);
  const subtotal = +items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
  const shipping = items.length && subtotal < 50 ? 7.99 : 0;
  return { items, subtotal, shipping, discount: 0, total: +(subtotal + shipping).toFixed(2) };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function parsePath(path) {
  const [pathname, query = ''] = String(path || '').split('?');
  return { pathname, params: new URLSearchParams(query) };
}

async function handleGet(path) {
  const { pathname, params } = parsePath(path);
  if (pathname === '/products') return { products: PRODUCTS };
  if (pathname === '/categories') return { categories: [...new Set(PRODUCTS.map((item) => item.category))].sort() };
  if (pathname === '/search') {
    const query = (params.get('q') || '').trim().toLowerCase();
    if (!query) return { products: [] };
    const audioQuery = ['head', 'headphone', 'ear', 'audio'].some((term) => query.startsWith(term));
    return { products: PRODUCTS.filter((product) => {
      const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return text.includes(query) || (audioQuery && /headphone|earbud|speaker/.test(text));
    }) };
  }
  if (/^\/products\/\d+$/.test(pathname)) {
    const product = productById(pathname.split('/').pop());
    if (!product) error('Product not found.', 404);
    return { product };
  }
  if (pathname === '/auth/me') return { user: publicUser(currentUserRecord()) };
  if (pathname === '/cart') {
    const user = currentUserRecord();
    return { cart: hydrateCart(readDb().carts[user.id] || []) };
  }
  if (pathname === '/wishlist') {
    const user = currentUserRecord();
    const ids = readDb().wishlists[user.id] || [];
    return { products: ids.map(productById).filter(Boolean) };
  }
  if (pathname === '/orders') {
    const user = currentUserRecord();
    return { orders: readDb().orders.filter((order) => order.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  }
  error('Local data route not found.', 404);
}

async function handlePost(path, body = {}) {
  const { pathname } = parsePath(path);
  if (pathname === '/auth/register') {
    const name = String(body.name || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (name.length < 2 || !validateEmail(email) || password.length < 8) {
      error('Use a valid name, email, and password of at least 8 characters.', 400);
    }
    const db = readDb();
    if (db.users.some((user) => user.email === email)) error('An account with this email already exists.', 409);
    const user = { id: makeId('usr'), name, email, passwordHash: await passwordDigest(password), createdAt: new Date().toISOString() };
    db.users.push(user); db.carts[user.id] = []; db.wishlists[user.id] = []; writeDb(db);
    return { token: makeToken(user.id), user: publicUser(user) };
  }
  if (pathname === '/auth/login') {
    const email = String(body.email || '').trim().toLowerCase();
    const passwordHash = await passwordDigest(String(body.password || ''));
    const user = readDb().users.find((item) => item.email === email && item.passwordHash === passwordHash);
    if (!user) error('Invalid email or password.', 401);
    return { token: makeToken(user.id), user: publicUser(user) };
  }
  if (pathname === '/cart') {
    const user = currentUserRecord();
    const productId = Number(body.productId); const quantity = Math.max(1, Number(body.quantity) || 1);
    const product = productById(productId);
    if (!product) error('Product not found.', 404);
    if (!product.stock) error('This product is out of stock.', 409);
    const db = readDb(); const list = db.carts[user.id] || (db.carts[user.id] = []);
    const existing = list.find((item) => item.productId === productId);
    const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + quantity);
    if (existing) existing.quantity = nextQuantity; else list.push({ productId, quantity: nextQuantity });
    writeDb(db);
    return { message: `${product.name} added to your cart.`, cart: hydrateCart(list) };
  }
  if (pathname === '/wishlist') {
    const user = currentUserRecord(); const productId = Number(body.productId); const product = productById(productId);
    if (!product) error('Product not found.', 404);
    const db = readDb(); const list = db.wishlists[user.id] || (db.wishlists[user.id] = []);
    if (!list.includes(productId)) list.push(productId); writeDb(db);
    return { message: 'Wishlist updated.', products: list.map(productById).filter(Boolean) };
  }
  if (pathname === '/newsletter') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!validateEmail(email)) error('Enter a valid email address.', 400);
    const db = readDb(); if (!db.newsletter.includes(email)) db.newsletter.push(email); writeDb(db);
    return { message: 'You are subscribed. Watch your inbox for special offers.' };
  }
  if (pathname === '/orders') {
    const user = currentUserRecord(); const db = readDb(); const cart = hydrateCart(db.carts[user.id] || []);
    if (!cart.items.length) error('Your cart is empty.', 400);
    const cleanAddress = (source = {}) => ({
      fullName: String(source.fullName || '').trim().slice(0, 100), address: String(source.address || '').trim().slice(0, 160),
      city: String(source.city || '').trim().slice(0, 80), postalCode: String(source.postalCode || '').trim().slice(0, 30),
      country: String(source.country || '').trim().slice(0, 80), phone: String(source.phone || '').trim().slice(0, 40)
    });
    const shippingAddress = cleanAddress(body.shippingAddress);
    const billingAddress = cleanAddress(body.billingAddress || body.shippingAddress);
    if (Object.values(shippingAddress).some((value) => !value)) error('Complete all shipping address fields.', 400);
    if (Object.values(billingAddress).some((value) => !value)) error('Complete all billing address fields.', 400);
    const paymentMethod = ['card', 'cod', 'paypal'].includes(body.paymentMethod) ? body.paymentMethod : 'card';
    const order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
      userId: user.id,
      items: cart.items.map(({ product, quantity, lineTotal }) => ({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity, lineTotal })),
      subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total, shippingAddress, billingAddress, paymentMethod,
      status: 'Processing', createdAt: new Date().toISOString()
    };
    db.orders.push(order); db.carts[user.id] = []; writeDb(db);
    return { message: 'Order placed successfully.', order };
  }
  error('Local data route not found.', 404);
}

async function handlePut(path, body = {}) {
  const { pathname } = parsePath(path);
  const match = pathname.match(/^\/cart\/(\d+)$/);
  if (!match) error('Local data route not found.', 404);
  const user = currentUserRecord(); const productId = Number(match[1]); const quantity = Number(body.quantity); const product = productById(productId);
  if (!product) error('Product not found.', 404);
  if (!Number.isInteger(quantity) || quantity < 1) error('Quantity must be at least 1.', 400);
  if (quantity > product.stock) error(`Only ${product.stock} item(s) are available.`, 409);
  const db = readDb(); const list = db.carts[user.id] || []; const item = list.find((entry) => entry.productId === productId);
  if (!item) error('Cart item not found.', 404);
  item.quantity = quantity; writeDb(db); return { cart: hydrateCart(list) };
}

async function handleDelete(path) {
  const { pathname } = parsePath(path);
  const user = currentUserRecord(); const db = readDb();
  let match = pathname.match(/^\/cart\/(\d+)$/);
  if (match) {
    const productId = Number(match[1]); db.carts[user.id] = (db.carts[user.id] || []).filter((item) => item.productId !== productId); writeDb(db);
    return { cart: hydrateCart(db.carts[user.id]) };
  }
  match = pathname.match(/^\/wishlist\/(\d+)$/);
  if (match) {
    const productId = Number(match[1]); db.wishlists[user.id] = (db.wishlists[user.id] || []).filter((id) => id !== productId); writeDb(db);
    return { message: 'Wishlist updated.', products: db.wishlists[user.id].map(productById).filter(Boolean) };
  }
  error('Local data route not found.', 404);
}

export const api = {
  get: (path) => Promise.resolve().then(() => handleGet(path)),
  post: (path, body) => Promise.resolve().then(() => handlePost(path, body)),
  put: (path, body) => Promise.resolve().then(() => handlePut(path, body)),
  delete: (path) => Promise.resolve().then(() => handleDelete(path))
};
