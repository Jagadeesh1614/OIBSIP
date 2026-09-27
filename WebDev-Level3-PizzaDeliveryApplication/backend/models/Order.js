const mongoose = require('mongoose');

const ORDER_STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Custom pizza selections (a preset-menu order can omit these and set presetPizza instead)
  base: { type: String },
  sauce: { type: String },
  cheese: { type: String },
  vegetables: [{ type: String }],
  presetPizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },

  amount: { type: Number, required: true }, // in paise (smallest currency unit), matches Razorpay
  currency: { type: String, default: 'INR' },

  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  paid: { type: Boolean, default: false },

  status: { type: String, enum: ORDER_STATUSES, default: 'Order Received' },
  stockDecremented: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
