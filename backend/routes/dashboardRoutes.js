const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');

// --- GET DASHBOARD STATS (Admin Only) ---
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    // 1. Inventory Stats (No change here)
    const inventoryStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStockUnits: { $sum: "$stock" },
          totalStockValue: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      }
    ]);
    
    // 2. Sales Metrics (FIXED AND EXPANDED)
    
    // A. Calculate Total Revenue (Completed Only)
    const totalRevenueResult = await Order.aggregate([
      { 
        $match: { status: "Completed" } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    // B. Calculate Total Orders Placed (NOT Cancelled)
    const totalOrderCountResult = await Order.aggregate([
      { 
        $match: { status: { $ne: "Cancelled" } } // Match anything NOT Cancelled
      },
      {
        $group: {
          _id: null,
          totalOrdersCount: { $sum: 1 }
        }
      }
    ]);
    
    // C. Get Pending and Cancelled Counts (NEW)
    const pendingOrdersCount = await Order.countDocuments({ status: "Pending" });
    const cancelledOrdersCount = await Order.countDocuments({ status: "Cancelled" }); // <-- NEW COUNT

    // 3. Consolidate results
    const inventory = inventoryStats[0] || { totalStockUnits: 0, totalStockValue: 0 };
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const totalOrders = totalOrderCountResult[0]?.totalOrdersCount || 0;
    const pendingOrders = pendingOrdersCount || 0;
    const cancelledOrders = cancelledOrdersCount || 0; // <-- NEW CONSOLIDATION


    res.json({
      inventory: {
        units: inventory.totalStockUnits,
        value: inventory.totalStockValue,
      },
      sales: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        pendingOrders: pendingOrders,
        cancelledOrders: cancelledOrders, // <-- ADDED TO RESPONSE
      }
    });

  } catch (err) {
    console.error('Dashboard Stats Error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
});

module.exports = router;