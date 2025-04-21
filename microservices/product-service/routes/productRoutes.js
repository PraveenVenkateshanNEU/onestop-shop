const express = require('express');
const axios = require('axios');
const router = express.Router();
const path = require('path');
const auth = require(path.resolve(__dirname, '../../../backend/middleware/auth'));
//const auth = require('../../backend/middleware/auth');


// ✅ Fetch products from Walmart
const fetchWalmartProducts = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/walmart');
        return response.data;
    } catch (err) {
        console.error('Error fetching Walmart products:', err.message);
        return [];
    }
};

// ✅ Fetch products from Amazon
const fetchAmazonProducts = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/amazon');
        return response.data;
    } catch (err) {
        console.error('Error fetching Amazon products:', err.message);
        return [];
    }
};

// ✅ Fetch products from Temu
const fetchTemuProducts = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/temu');
        return response.data;
    } catch (err) {
        console.error('Error fetching Temu products:', err.message);
        return [];
    }
};

// ✅ Utility function to tag source
const tagWithSource = (products, source) =>
    products.map(p => ({ ...p, source }));

// ✅ Aggregate all products from Walmart, Amazon, and Temu
router.get('/', async (req, res) => {
    try {
        // const walmartProducts = await fetchWalmartProducts();
        // const amazonProducts = await fetchAmazonProducts();
        // const temuProducts = await fetchTemuProducts();
        const walmartProducts = tagWithSource(await fetchWalmartProducts(), 'Walmart');
        const amazonProducts = tagWithSource(await fetchAmazonProducts(), 'Amazon');
        const temuProducts = tagWithSource(await fetchTemuProducts(), 'Temu');

        const allProducts = [...walmartProducts, ...amazonProducts, ...temuProducts];
        res.json(allProducts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
