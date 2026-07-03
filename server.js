const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

// 1. Load Configurations (.env variables)
dotenv.config();

// 2. Initialize Express Application Engine
const app = express();

// 3. Standard Middlewares Setup
app.use(cors());              // Frontend se connection bridge block hatane ke liye
app.use(express.json());      // Incoming JSON body data parse karne ke liye

// 4. Connect to MongoDB Database
connectDB();

// 5. System Sub-Routes Mapping (Standard Roadmap)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/products', require('./routes/productRoutes')); 


// Base Test Route (Browser verification path)
app.get('/', (req, res) => {
  res.status(200).send('🍕 FoodExpress Backend Engine is active and running.');
});

// Global Fallback Route (Agar koi galat URL hit kare)
app.use((req, res) => {
  res.status(404).json({ msg: 'Requested URL or API endpoint not found on this server.' });
});

// 6. Start Server Listener Engine
// 6. Start Server Listener Engine
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 System Server initialized successfully on Port: ${PORT}`);
  console.log(`🔗 Local Testing Link: http://localhost:${PORT}/`);
});

// server.js ke end mein yeh line honi chahiye:
module.exports = app;