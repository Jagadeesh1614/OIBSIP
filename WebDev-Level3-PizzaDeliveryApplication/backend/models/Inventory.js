const mongoose = require('mongoose');

// One document per ingredient. `type` groups items for the pizza builder
// (base / sauce / cheese / vegetable) and for the admin inventory dashboard.
const inventorySchema = new mongoose.Schema({
  type: { type: String, enum: ['base', 'sauce', 'cheese', 'vegetable'], required: true },
  name: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  threshold: { type: Number, required: true, default: 20 }, // low-stock alert level
  lowStockAlerted: { type: Boolean, default: false }, // avoid spamming repeat emails
}, { timestamps: true });

inventorySchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
