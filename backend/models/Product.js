const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  imageUrls: [ // <-- This is the updated line
    { type: String }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);