const products = require('../data/products');

function listProducts(req, res) {
  return res.json({ products });
}

function getProduct(req, res) {
  const product = products.find((item) => item.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  return res.json({ product });
}

function categories(req, res) {
  const values = [...new Set(products.map((item) => item.category))].sort();
  return res.json({ categories: values });
}

function searchProducts(req, res) {
  const query = String(req.query.q || '').trim().toLowerCase();
  if (!query) return res.json({ products: [] });
  const audioQuery = ['head', 'headphone', 'ear', 'audio'].some((term) => query.startsWith(term));
  const matches = products.filter((product) => {
    const text = [product.name, product.category, product.description].join(' ').toLowerCase();
    return text.includes(query) || (audioQuery && /headphone|earbud|speaker/.test(text));
  });
  return res.json({ products: matches });
}

module.exports = { listProducts, getProduct, categories, searchProducts };
