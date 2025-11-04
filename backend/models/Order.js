const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  // Link to the user who placed the order
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Link to the product that was ordered
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  // We'll store the price at the time of purchase
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Order', OrderSchema);