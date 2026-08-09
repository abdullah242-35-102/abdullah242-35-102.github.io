const products = require('../data/products');
const { readStore, updateStore } = require('../utils/store');

function hydrate(ids = []) {
  return ids.map((id) => products.find((product) => product.id === id)).filter(Boolean);
}

function getWishlist(req, res) {
  return res.json({ products: hydrate(readStore().wishlists[req.user.sub] || []) });
}

function addWishlist(req, res) {
  const productId = Number(req.body.productId);
  const product = products.find((item) => item.id === productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const ids = updateStore((data) => {
    const list = data.wishlists[req.user.sub] || (data.wishlists[req.user.sub] = []);
    if (!list.includes(productId)) list.push(productId);
    return list;
  });
  return res.status(201).json({ message: 'Wishlist updated.', products: hydrate(ids) });
}

function removeWishlist(req, res) {
  const productId = Number(req.params.productId);
  const ids = updateStore((data) => {
    data.wishlists[req.user.sub] = (data.wishlists[req.user.sub] || []).filter((id) => id !== productId);
    return data.wishlists[req.user.sub];
  });
  return res.json({ message: 'Wishlist updated.', products: hydrate(ids) });
}

module.exports = { getWishlist, addWishlist, removeWishlist };
