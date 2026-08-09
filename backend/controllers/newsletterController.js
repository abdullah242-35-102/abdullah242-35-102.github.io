const { updateStore } = require('../utils/store');
const { validEmail } = require('../utils/validators');

function subscribe(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  updateStore((data) => {
    if (!data.newsletter.includes(email)) data.newsletter.push(email);
  });
  return res.status(201).json({ message: 'You are subscribed. Watch your inbox for special offers.' });
}

module.exports = { subscribe };
