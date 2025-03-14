const express = require('express');
const axios = require('axios');
const router = express.Router();

const auth = require('../../backend/middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Fetch products from Walmart
const fetchWalmartProducts = async () => {
    try {
        const response = await axios.get('http://localhost:5008/api/walmart');
        return response.data;
    } catch (err) {
        console.error('Error fetching Walmart products:', err.message);
        return [];
    }
};

// ✅ Fetch products from Amazon
const fetchAmazonProducts = async () => {
    try {
        const response = await axios.get('http://localhost:5009/api/amazon');
        return response.data;
    } catch (err) {
        console.error('Error fetching Amazon products:', err.message);
        return [];
    }
};

// ✅ Fetch products from Temu
const fetchTemuProducts = async () => {
    try {
        const response = await axios.get('http://localhost:5010/api/temu');
        return response.data;
    } catch (err) {
        console.error('Error fetching Temu products:', err.message);
        return [];
    }
};

// ✅ Aggregate all products from Walmart, Amazon, and Temu
router.get('/', async (req, res) => {
    try {
        const walmartProducts = await fetchWalmartProducts();
        const amazonProducts = await fetchAmazonProducts();
        const temuProducts = await fetchTemuProducts();

        const allProducts = [...walmartProducts, ...amazonProducts, ...temuProducts];
        res.json(allProducts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
