import { api } from './api.js';
import { getProducts, renderProductList, skeletonCards } from './products.js';

function debounce(fn, delay = 250) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function localMatches(product, query) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
  if (haystack.includes(q)) return true;
  const audioAliases = ['head', 'headphone', 'ear', 'audio'];
  return audioAliases.some((alias) => q.startsWith(alias)) && /headphone|earbud|speaker/.test(haystack);
}

export function initHeaderSearch() {
  const input = document.getElementById('global-search');
  const suggestions = document.getElementById('search-suggestions');
  const form = document.getElementById('global-search-form');
  if (!input || !suggestions || !form) return;

  const loadSuggestions = debounce(async () => {
    const q = input.value.trim();
    if (q.length < 2) { suggestions.classList.add('hidden'); return; }
    try {
      const { products } = await api.get(`/search?q=${encodeURIComponent(q)}`);
      suggestions.innerHTML = products.slice(0, 5).map((product) => `<a class="suggestion-item" href="product.html?id=${product.id}"><img src="${product.image}" alt=""><div><strong>${product.name}</strong><span>${product.category} · $${product.price.toFixed(2)}</span></div></a>`).join('') || '<div class="suggestion-item"><div><strong>No direct matches</strong><span>Press Enter to search the full catalog.</span></div></div>';
      suggestions.classList.remove('hidden');
    } catch { suggestions.classList.add('hidden'); }
  });
  input.addEventListener('input', loadSuggestions);
  input.addEventListener('blur', () => setTimeout(() => suggestions.classList.add('hidden'), 120));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = input.value.trim();
    if (q) location.href = `shop.html?q=${encodeURIComponent(q)}`;
  });
}

export async function initShop() {
  const grid = document.getElementById('shop-products');
  if (!grid) return;
  grid.innerHTML = skeletonCards(8);
  const products = await getProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const categoryBox = document.getElementById('category-filters');
  categoryBox.innerHTML = categories.map((category) => `<label><input type="checkbox" name="category" value="${category}"> ${category}</label>`).join('');

  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('category');
  const query = params.get('q') || '';
  const dealsOnly = params.get('deals') === '1';
  const sortSelect = document.getElementById('sort-products');
  if (params.get('sort')) sortSelect.value = params.get('sort');
  if (initialCategory) categoryBox.querySelector(`input[value="${CSS.escape(initialCategory)}"]`)?.setAttribute('checked', 'checked');

  const apply = () => {
    const checkedCategories = [...document.querySelectorAll('input[name="category"]:checked')].map((input) => input.value);
    const price = document.querySelector('input[name="price"]:checked')?.value || 'all';
    const rating = Number(document.querySelector('input[name="rating"]:checked')?.value || 0);
    const stockOnly = document.getElementById('in-stock-only').checked;
    let result = products.filter((product) => localMatches(product, query));
    if (checkedCategories.length) result = result.filter((p) => checkedCategories.includes(p.category));
    if (dealsOnly) result = result.filter((p) => p.oldPrice > p.price);
    result = result.filter((p) => {
      if (price === 'under50') return p.price < 50;
      if (price === '50-100') return p.price >= 50 && p.price <= 100;
      if (price === '100-500') return p.price > 100 && p.price <= 500;
      if (price === '500plus') return p.price > 500;
      return true;
    }).filter((p) => p.rating >= rating).filter((p) => !stockOnly || p.stock > 0);

    const sort = sortSelect.value;
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'popular') result.sort((a, b) => b.reviews - a.reviews);
    if (sort === 'newest') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === 'featured') result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating);
    renderProductList(grid, result);
    document.getElementById('result-count').textContent = `${result.length} product${result.length === 1 ? '' : 's'}${query ? ` matching “${query}”` : ''}`;
    document.getElementById('shop-empty').classList.toggle('hidden', result.length > 0);
    grid.classList.toggle('hidden', result.length === 0);
  };

  const clear = () => {
    document.querySelectorAll('input[name="category"]').forEach((i) => { i.checked = false; });
    document.querySelector('input[name="price"][value="all"]').checked = true;
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    document.getElementById('in-stock-only').checked = false;
    sortSelect.value = 'featured';
    history.replaceState({}, '', 'shop.html');
    location.reload();
  };

  document.getElementById('filter-panel').addEventListener('change', apply);
  sortSelect.addEventListener('change', apply);
  document.getElementById('clear-filters').addEventListener('click', clear);
  document.getElementById('empty-clear').addEventListener('click', clear);
  document.querySelector('[data-open-filters]')?.addEventListener('click', () => document.getElementById('filter-panel').classList.add('is-open'));
  document.querySelector('[data-close-filters]')?.addEventListener('click', () => document.getElementById('filter-panel').classList.remove('is-open'));
  apply();
}
