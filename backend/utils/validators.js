const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value, max = 200) {
  return String(value ?? '').trim().replace(/[<>]/g, '').slice(0, max);
}

function validEmail(value) {
  return emailPattern.test(String(value || '').trim().toLowerCase());
}

module.exports = { cleanText, validEmail };
