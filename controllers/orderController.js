const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

exports.placeOrder = async (req, res) => {
  try {
    const { items, totalPrice, address, phone, payment } = req.body;
    
    // Header se token nikalna aur verify karna
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Naya order create karna
    const newOrder = new Order({
      userId: decoded.id, // Token se nikali hui ID
      items,
      totalPrice,
      address,
      phone,
      paymentMethod: payment
    });

    await newOrder.save();
    res.status(201).json({ success: true, msg: '⚡ Order Placed Successfully in Database!' });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error in Placing Order: ' + err.message });
  }
};

// Order create karne ka function
const createOrder = async (req, res) => {
    try {
        // Aapka order processing ka logic yahan aayega
        // Example ke liye abhi basic response bhej rahe hain
        const { products, totalAmount, shippingAddress } = req.body;

        res.status(201).json({ 
            success: true, 
            message: "Order created successfully!",
            orderData: { products, totalAmount, shippingAddress }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error while creating order", 
            error: error.message 
        });
    }
};

// Sabse zaroori hissa: createOrder ko object ke andar daal kar export kiya
module.exports = {
    createOrder
};