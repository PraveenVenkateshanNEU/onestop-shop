const express = require('express');
const path = require('path');
const Order = require('../models/order');
const auth = require(path.resolve(__dirname, '../../../backend/middleware/auth'));
const router = express.Router();

// Place an Order
router.post('/create', auth, async (req, res) => {
    try {
        const { products } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "No products in order." });
        }

        const totalAmount = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

        const newOrder = new Order({
            userId: req.user.userId,
            products,
            totalAmount
        });

        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Orders for Logged-in User
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Order by ID
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.userId });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
