const crypto = require('crypto');
const { readStore, updateStore } = require('../utils/store');
const { hydrateCart } = require('./cartController');
const { cleanText } = require('../utils/validators');

function getOrders(req, res) {
  const orders = readStore().orders.filter((order) => order.userId === req.user.sub).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return res.json({ orders });
}

function createOrder(req, res) {
  const data = readStore();
  const cart = hydrateCart(data.carts[req.user.sub] || []);
  if (!cart.items.length) return res.status(400).json({ message: 'Your cart is empty.' });

  const address = req.body.shippingAddress || {};
  const shippingAddress = {
    fullName: cleanText(address.fullName, 100),
    address: cleanText(address.address, 160),
    city: cleanText(address.city, 80),
    postalCode: cleanText(address.postalCode, 30),
    country: cleanText(address.country, 80),
    phone: cleanText(address.phone, 40)
  };
  if (Object.values(shippingAddress).some((value) => !value)) {
    return res.status(400).json({ message: 'Complete all shipping address fields.' });
  }

  const billing = req.body.billingAddress || address;
  const billingAddress = {
    fullName: cleanText(billing.fullName, 100),
    address: cleanText(billing.address, 160),
    city: cleanText(billing.city, 80),
    postalCode: cleanText(billing.postalCode, 30),
    country: cleanText(billing.country, 80),
    phone: cleanText(billing.phone, 40)
  };
  if (Object.values(billingAddress).some((value) => !value)) {
    return res.status(400).json({ message: 'Complete all billing address fields.' });
  }

  const allowedPayments = ['card', 'cod', 'paypal'];
  const paymentMethod = allowedPayments.includes(req.body.paymentMethod) ? req.body.paymentMethod : 'card';
  const order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    userId: req.user.sub,
    items: cart.items.map(({ product, quantity, lineTotal }) => ({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity, lineTotal })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    shippingAddress,
    billingAddress,
    paymentMethod,
    status: 'Processing',
    createdAt: new Date().toISOString()
  };

  updateStore((store) => {
    store.orders.push(order);
    store.carts[req.user.sub] = [];
  });
  return res.status(201).json({ message: 'Order placed successfully.', order });
}

module.exports = { getOrders, createOrder };
