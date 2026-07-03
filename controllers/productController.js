const Product = require('../models/Product');

// 1. GET ALL PRODUCTS (Database se items nikalne ke liye)
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    // Agar frontend se kisi khass category (like Pizza) ki demand ho
    if (category && category !== 'All') {
      query.category = category;
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error fetching products: ' + err.message });
  }
};

// 2. SEED 100 PRODUCTS (Database mein automatic 100 items load karne ke liye)
exports.seedProducts = async (req, res) => {
  try {
    // Check karo pehle se data maujood to nahi
    const count = await Product.countDocuments();
    if (count > 0) return res.status(400).json({ msg: 'Products already seeded!' });

    const categories = ['Burgers', 'Pizza', 'Desi', 'Desserts'];
    const images = {
      Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      Desi: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500',
      Desserts: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500'
    };

    const mockProducts = [];
    // Loop chala kar dynamic 100 products ki array generate karna
    for (let i = 1; i <= 100; i++) {
      const category = categories[i % categories.length];
      mockProducts.push({
        id: i,
        name: `${category} Premium Item #${i}`,
        category: category,
        price: Math.floor(Math.random() * (1500 - 150 + 1)) + 150, // Price between 150 and 1500
        img: images[category]
      });
    }

    // Ek sath database mein push karna
    await Product.insertMany(mockProducts);
    res.status(201).json({ msg: 'Successfully seeded 100 products into Database!' });
  } catch (err) {
    res.status(500).json({ msg: 'Error seeding products: ' + err.message });
  }
};