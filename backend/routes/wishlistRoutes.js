const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getWishlist, addWishlist, removeWishlist } = require('../controllers/wishlistController');

router.use(authMiddleware);
router.get('/', getWishlist);
router.post('/', addWishlist);
router.delete('/:productId', removeWishlist);

module.exports = router;
