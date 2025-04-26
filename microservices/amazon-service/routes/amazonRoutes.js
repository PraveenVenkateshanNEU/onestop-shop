const express = require('express');
const Product = require('../models/product');
const router = express.Router();

const path = require('path');
const auth = require(path.resolve(__dirname, '../../../backend/middleware/auth'));

// Get Amazon Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Amazon Product
router.post(
    '/add',
    auth,
    async (req, res) => {
      if (req.user.role !== 'admin')
        return res.status(403).json({ message: 'Access denied' });
  
      try {
        const { name, description, price, category, image } = req.body;
  
        // Build either uploaded-file URL or fallback URL
        const imageUrl = req.file
          ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
          : (image || 'https://via.placeholder.com/150');
  
        const newProduct = new Product({
          name,
          description,
          price,
          category,
          image: imageUrl
        });
  
        await newProduct.save();
        res.status(201).json(newProduct);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  );

// router.post('/add', auth, async (req, res) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ message: 'Access denied' });
//     }
//     try {
//         const { name, description, price, category } = req.body;

//         const newProduct = new Product({
//             name,
//             description,
//             price,
//             category,
//             image: `https://via.placeholder.com/150`
//         });

//         await newProduct.save();
//         res.status(201).json(newProduct);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// Delete Amazon Product
router.delete(
    '/delete/:id',
    auth,
    async (req, res) => {
      // 1) guard admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      try {
        // 2) remove by ID
        const { id } = req.params;
        await Product.deleteOne({ _id: id });
        return res.json({ message: 'Deleted successfully' });
      } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ message: err.message });
      }
    }
  );  

module.exports = router;
