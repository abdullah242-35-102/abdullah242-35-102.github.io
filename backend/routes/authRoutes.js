const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, me } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

module.exports = router;
