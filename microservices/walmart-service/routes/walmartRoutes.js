const express = require('express');
const Product = require('../models/product');
const router = express.Router();

// Get Walmart Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Walmart Product
router.post('/add', async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            image: req.body.image || "https://via.placeholder.com/150"
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    
});

module.exports = router;
