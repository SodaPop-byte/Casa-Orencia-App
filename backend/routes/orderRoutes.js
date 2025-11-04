const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');

// --- GET ALL ORDERS (For Admin Only) ---
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'email')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get admin orders error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching admin orders' });
  }
});

// --- (FIXED) GET MY ORDERS (For Logged-in Resellers) ---
router.get('/myorders', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const myOrders = await Order.find({ userId: userId })
      // CRITICAL FIX: Populate all necessary product fields for display (Name, Price, Stock, and BOTH image formats)
      .populate('productId', 'name price stock imageUrls imageUrl') 
      .sort({ createdAt: -1 });
    res.json(myOrders);
  } catch (err) {
    console.error('Get my orders error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching your orders' });
  }
});


// --- POST A NEW ORDER (For Logged-in Users) ---
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    product.stock -= quantity;
    const updatedProduct = await product.save();

    const newOrder = new Order({
      userId: userId,
      productId: productId,
      quantity: quantity,
      totalPrice: product.price * quantity,
      status: 'Pending'
    });
    const savedOrder = await newOrder.save();
    
    const io = req.app.get('io');
    io.emit('stockUpdated', updatedProduct);

    const populatedOrder = await Order.findById(savedOrder._id)
                                      .populate('userId', 'email')
                                      .populate('productId', 'name');
    io.emit('newOrder', populatedOrder);

    res.status(200).json({
      message: 'Order placed successfully',
      product: updatedProduct
    });

  } catch (err) {
    console.error('Order error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// --- UPDATE ORDER STATUS (Admin Only) ---
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    )
      .populate('userId', 'email')
      .populate('productId', 'name');

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const io = req.app.get('io');
    io.emit('orderStatusUpdated', updatedOrder); 

    res.json(updatedOrder);

  } catch (err) {
    console.error('Update order status error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

module.exports = router;