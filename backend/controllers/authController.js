const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { readStore, updateStore } = require('../utils/store');
const { cleanText, validEmail } = require('../utils/validators');

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

async function register(req, res) {
  const name = cleanText(req.body.name, 80);
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (name.length < 2 || !validEmail(email) || password.length < 8) {
    return res.status(400).json({ message: 'Use a valid name, email, and password of at least 8 characters.' });
  }

  const existing = readStore().users.find((user) => user.email === email);
  if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  updateStore((data) => {
    data.users.push(user);
    data.carts[user.id] = [];
    data.wishlists[user.id] = [];
  });

  return res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = readStore().users.find((item) => item.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({ token: signToken(user), user: publicUser(user) });
}

function me(req, res) {
  const user = readStore().users.find((item) => item.id === req.user.sub);
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  return res.json({ user: publicUser(user) });
}

module.exports = { register, login, me };
