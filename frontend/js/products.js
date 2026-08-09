import { api } from './api.js';

let productCache = null;
let productPromise = null;

export async function getProducts(force = false) {
  if (force) productCache = null;
  if (productCache) return productCache;
  if (!productPromise || force) {
    productPromise = api.get('/products').then(({ products }) => {
      productCache = products;
      return products;
    }).finally(() => { productPromise = null; });
  }
  return productPromise;
}

export function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function discountPercent(product) {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}

function stockLabel(product) {
  if (product.stock === 0) return ['Out of Stock', 'out'];
  if (product.stock <= 5) return [`Only ${product.stock} left`, 'low'];
  return ['In Stock', ''];
}

export function productCard(product) {
  const discount = discountPercent(product);
  const [stockText, stockClass] = stockLabel(product);
  return `
    <article class="product-card" data-product-card="${product.id}" itemscope itemtype="https://schema.org/Product">
      <div class="product-media">
        <a href="product.html?id=${product.id}" aria-label="View ${escapeHtml(product.name)}"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" itemprop="image"></a>
        ${discount ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
        <button class="wishlist-btn" type="button" data-action="wishlist" data-product-id="${product.id}" aria-label="Add ${escapeHtml(product.name)} to wishlist">♡</button>
        <button class="quick-view-btn" type="button" data-action="quick-view" data-product-id="${product.id}">Quick View</button>
      </div>
      <div class="product-body">
        <span class="product-category">${escapeHtml(product.category)}</span>
        <a class="product-name" href="product.html?id=${product.id}" itemprop="name">${escapeHtml(product.name)}</a>
        <div class="product-rating" aria-label="${product.rating} out of 5 stars">★★★★★ <small>${product.rating} (${product.reviews})</small></div>
        <div class="product-price"><strong>${money(product.price)}</strong>${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ''}</div>
        <span class="stock-note ${stockClass}">${stockText}</span>
        <div class="product-actions"><button class="btn btn-primary btn-block" type="button" data-action="add-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button></div>
      </div>
    </article>`;
}

export function skeletonCards(count = 4) {
  return Array.from({ length: count }, () => `<div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-lines"><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div></div>`).join('');
}

export function renderProductList(element, products) {
  if (!element) return;
  element.innerHTML = products.map(productCard).join('');
  document.dispatchEvent(new CustomEvent('products:rendered'));
}

function categoryCard(category, product, count) {
  return `<a class="category-card" href="shop.html?category=${encodeURIComponent(category)}"><strong>${escapeHtml(category)}</strong><span>${count} product${count === 1 ? '' : 's'}</span><img src="${product.image}" alt="" loading="lazy"></a>`;
}

export async function renderHomeProducts() {
  const targets = ['featured-products', 'deal-products', 'new-products', 'best-products'];
  targets.forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = skeletonCards(4); });
  const products = await getProducts();
  const categories = [...new Set(products.map((p) => p.category))];
  const categoryGrid = document.getElementById('category-grid');
  if (categoryGrid) categoryGrid.innerHTML = categories.map((category) => {
    const matches = products.filter((p) => p.category === category);
    return categoryCard(category, matches[0], matches.length);
  }).join('');
  renderProductList(document.getElementById('featured-products'), products.filter((p) => p.featured).slice(0, 8));
  renderProductList(document.getElementById('deal-products'), [...products].sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 4));
  renderProductList(document.getElementById('new-products'), [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4));
  renderProductList(document.getElementById('best-products'), [...products].sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating)).slice(0, 4));
}

export async function getProduct(id) {
  const cached = productCache?.find((item) => item.id === Number(id));
  if (cached) return cached;
  return (await api.get(`/products/${Number(id)}`)).product;
}

export async function renderProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container) return;
  const id = Number(new URLSearchParams(location.search).get('id'));
  if (!id) {
    container.innerHTML = '<div class="empty-state"><h2>Product not found</h2><p>Choose a product from the shop.</p><a class="btn btn-primary" href="shop.html">Browse Products</a></div>';
    return;
  }
  try {
    const product = await getProduct(id);
    document.title = `${product.name} | YourStore`;
    const discount = discountPercent(product);
    const [stockText, stockClass] = stockLabel(product);
    container.innerHTML = `<div class="product-detail-grid" itemscope itemtype="https://schema.org/Product">
      <div class="product-gallery">
        <div class="main-product-image"><img id="detail-main-image" src="${product.image}" alt="${escapeHtml(product.name)}" itemprop="image"></div>
        <div class="thumb-row"><button class="thumb-btn is-active" type="button" aria-label="Product image"><img src="${product.image}" alt=""></button><button class="thumb-btn" type="button" aria-label="Alternate product view"><img src="${product.image}" alt=""></button><button class="thumb-btn" type="button" aria-label="Alternate product view"><img src="${product.image}" alt=""></button></div>
      </div>
      <div class="product-info">
        <span class="detail-category">${escapeHtml(product.category)}</span>
        <h1 class="detail-title" itemprop="name">${escapeHtml(product.name)}</h1>
        <div class="detail-rating">★★★★★ <span>${product.rating} · ${product.reviews} reviews</span></div>
        <div class="detail-price"><strong>${money(product.price)}</strong><del>${money(product.oldPrice)}</del>${discount ? `<span class="detail-discount">SAVE ${discount}%</span>` : ''}</div>
        <p class="detail-desc" itemprop="description">${escapeHtml(product.description)}</p>
        <ul class="feature-list">${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
        <span class="stock-note ${stockClass}">${stockText} · ${product.stock} units available</span>
        <div class="purchase-row">
          <div class="qty-control"><button type="button" data-detail-qty="minus" aria-label="Decrease quantity">−</button><input id="detail-quantity" type="number" min="1" max="${product.stock}" value="1" aria-label="Quantity"><button type="button" data-detail-qty="plus" aria-label="Increase quantity">+</button></div>
          <button class="btn btn-primary btn-lg" type="button" data-action="add-cart" data-product-id="${product.id}" data-quantity-source="detail-quantity" ${product.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
          <button class="btn btn-outline btn-lg" type="button" data-action="wishlist" data-product-id="${product.id}" aria-label="Add to wishlist">♡</button>
        </div>
        <button class="btn btn-outline btn-block" style="margin-top:12px" type="button" data-action="buy-now" data-product-id="${product.id}" data-quantity-source="detail-quantity" ${product.stock === 0 ? 'disabled' : ''}>Buy Now</button>
        <div class="detail-info-grid"><div class="info-box"><strong>Shipping</strong><span>Free over $50; otherwise $7.99.</span></div><div class="info-box"><strong>Returns</strong><span>Easy 30-day return policy.</span></div><div class="info-box"><strong>Availability</strong><span>${stockText}</span></div><div class="info-box"><strong>Secure checkout</strong><span>Protected authenticated order flow.</span></div></div>
      </div>
    </div>`;
    const products = await getProducts();
    renderProductList(document.getElementById('related-products'), products.filter((p) => p.category === product.category && p.id !== product.id).concat(products.filter((p) => p.id !== product.id && p.category !== product.category)).slice(0, 4));
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h2>Product unavailable</h2><p>${escapeHtml(error.message)}</p><a class="btn btn-primary" href="shop.html">Back to Shop</a></div>`;
  }
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
