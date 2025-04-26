const express = require('express');
const Product = require('../models/product');
const multer   = require('multer');
const router = express.Router();
const debug = require('debug')('temu:delete');

const path = require('path');
const auth = require(path.resolve(__dirname, '../../../backend/middleware/auth'));

// Multer setup — store all files in shared ../uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads')); // ← points to microservices/uploads
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext);
    }
  });
  const upload = multer({ storage });

// Get Temu Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Temu Product
// — ADD product (with imageFile or URL fallback) —
router.post(
    '/add',
    auth,
    upload.single('imageFile'),  // ← multer middleware
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

// Delete Amazon Product
router.delete(
    '/delete/:id',
    auth,
    async (req, res) => {
      // 1) guard admin
      debug('Incoming DELETE %s by user %o', req.params.id, req.user);
      if (req.user.role !== 'admin') {
        debug(' → access denied for', req.user);
        return res.status(403).json({ message: 'Access denied' });
      }
  
      try {
        // 2) remove by ID
        const { id } = req.params;
        debug(' → removing product', id);
        await Product.deleteOne({ _id: id });
        debug(' → removal successful');
        return res.json({ message: 'Deleted successfully' });
      } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ message: err.message });
      }
    }
  );

  router.get('/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // 2) update product
  router.put(
    '/update/:id',
    auth,
    async (req, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
      try {
        const { name, description, price, category, image } = req.body;
        const updated = await Product.findByIdAndUpdate(
          req.params.id,
          { name, description, price, category, image },
          { new: true }
        );
        res.json(updated);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  );
  

module.exports = router;
