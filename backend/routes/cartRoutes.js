const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCart, addCartItem, updateCartItem, removeCartItem } = require('../controllers/cartController');

router.use(authMiddleware);
router.get('/', getCart);
router.post('/', addCartItem);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);

module.exports = router;
