const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getOrders, createOrder } = require('../controllers/orderController');

router.use(authMiddleware);
router.get('/', getOrders);
router.post('/', createOrder);

module.exports = router;
