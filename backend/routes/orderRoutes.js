const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const { upload, cloudinary } = require('../utils/cloudinary');

// --- GET ALL PRODUCTS (UPGRADED FOR SEARCH AND FILTERING) ---
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// --- POST NEW PRODUCT ---
router.post('/', auth, adminOnly, upload.array('images', 5), async (req, res) => {
  console.log('>>> Request received by POST /api/products handler');
  console.log('Request Body:', req.body);
  console.log('Request Files (plural):', req.files);
  try {
    const { name, category, price, stock } = req.body;
    
    if (!req.files || req.files.length === 0) {
      console.error('ERROR: req.files is missing or empty!');
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    const imageUrls = req.files.map(file => file.path);
    console.log('Image URLs from Cloudinary:', imageUrls);

    const product = new Product({
      name,
      category,
      price,
      stock,
      imageUrls: imageUrls
    });

    console.log('Attempting to save product...');
    await product.save();
    console.log('Product saved successfully!');

    const io = req.app.get('io');
    io.emit('newProduct', product);

    res.status(201).json(product);
  } catch (err) {
    console.error('!!! CRASH IN POST /api/products:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add product (server error)' });
  }
});

// --- PUT (UPDATE) A PRODUCT ---
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const productId = req.params.id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    if (Object.keys(updateData).length === 0) {
       return res.status(400).json({ error: 'No update data provided' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const io = req.app.get('io');
    if (updateData.stock !== undefined && Object.keys(updateData).length === 1) {
       io.emit('stockUpdated', updatedProduct);
    } else {
       io.emit('productUpdated', updatedProduct);
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// --- DELETE A PRODUCT ---
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.imageUrls && product.imageUrls.length > 0) {
      console.log(`Deleting ${product.imageUrls.length} images from Cloudinary...`);
      const publicIds = product.imageUrls.map(url => {
        const parts = url.split('/');
        const publicIdWithFolder = parts[parts.length - 2] + '/' + parts[parts.length - 1].split('.')[0];
        return publicIdWithFolder;
      });
      await cloudinary.api.delete_resources(publicIds);
      console.log('Cloudinary images deleted.');
    }

    await Product.findByIdAndDelete(productId);

    const io = req.app.get('io');
    io.emit('productDeleted', { id: productId });

    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('Error deleting product:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;