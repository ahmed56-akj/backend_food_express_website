const express = require('express');
const router = express.Router();
// Controller se createOrder ko sahi se import kiya
const { createOrder } = require('../controllers/orderController');

// Checkout route setup kiya
router.post('/checkout', createOrder);

module.exports = router;