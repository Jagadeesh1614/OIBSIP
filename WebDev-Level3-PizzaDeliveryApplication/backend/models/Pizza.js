const mongoose = require('mongoose');

// Preset menu items shown on the dashboard, separate from the custom builder.
const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Pizza', pizzaSchema);
