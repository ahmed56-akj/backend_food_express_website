const express = require('express');
const router = express.Router();
const { signup, verifyOtp, login, forgotPassword  } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

module.exports = router;