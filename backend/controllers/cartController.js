const products = require('../data/products');
const { readStore, updateStore } = require('../utils/store');

function hydrateCart(entries = []) {
  const items = entries.map((entry) => {
    const product = products.find((item) => item.id === entry.productId);
    return product ? { product, quantity: entry.quantity, lineTotal: +(product.price * entry.quantity).toFixed(2) } : null;
  }).filter(Boolean);
  const subtotal = +items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
  const shipping = items.length && subtotal < 50 ? 7.99 : 0;
  return { items, subtotal, shipping, discount: 0, total: +(subtotal + shipping).toFixed(2) };
}

function getCart(req, res) {
  const entries = readStore().carts[req.user.sub] || [];
  return res.json({ cart: hydrateCart(entries) });
}

function addCartItem(req, res) {
  const productId = Number(req.body.productId);
  const quantity = Math.max(1, Number(req.body.quantity) || 1);
  const product = products.find((item) => item.id === productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (product.stock === 0) return res.status(409).json({ message: 'This product is out of stock.' });

  const entries = updateStore((data) => {
    const cart = data.carts[req.user.sub] || (data.carts[req.user.sub] = []);
    const existing = cart.find((item) => item.productId === productId);
    const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + quantity);
    if (existing) existing.quantity = nextQuantity;
    else cart.push({ productId, quantity: nextQuantity });
    return cart;
  });

  return res.status(201).json({ message: `${product.name} added to your cart.`, cart: hydrateCart(entries) });
}

function updateCartItem(req, res) {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);
  const product = products.find((item) => item.id === productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });
  if (quantity > product.stock) return res.status(409).json({ message: `Only ${product.stock} item(s) are available.` });

  let found = false;
  const entries = updateStore((data) => {
    const cart = data.carts[req.user.sub] || [];
    const entry = cart.find((item) => item.productId === productId);
    if (entry) {
      entry.quantity = quantity;
      found = true;
    }
    return cart;
  });

  if (!found) return res.status(404).json({ message: 'Cart item not found.' });
  return res.json({ cart: hydrateCart(entries) });
}

function removeCartItem(req, res) {
  const productId = Number(req.params.productId);
  const entries = updateStore((data) => {
    const cart = data.carts[req.user.sub] || [];
    data.carts[req.user.sub] = cart.filter((item) => item.productId !== productId);
    return data.carts[req.user.sub];
  });
  return res.json({ cart: hydrateCart(entries) });
}

module.exports = { getCart, addCartItem, updateCartItem, removeCartItem, hydrateCart };
