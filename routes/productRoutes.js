const express = require('express');
const router = express.Router();
const { getProducts, seedProducts } = require('../controllers/productController');

// 1. GET /api/products -> Saare products ko database se fetch karne ke liye
router.get('/', getProducts);

// 2. POST /api/products/seed -> Database mein 100 items dummy data load karne ke liye
router.post('/seed', seedProducts);

module.exports = router;