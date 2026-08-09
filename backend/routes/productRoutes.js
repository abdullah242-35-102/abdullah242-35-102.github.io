const router = require('express').Router();
const { listProducts, getProduct, categories, searchProducts } = require('../controllers/productController');

router.get('/products', listProducts);
router.get('/products/:id', getProduct);
router.get('/categories', categories);
router.get('/search', searchProducts);

module.exports = router;
