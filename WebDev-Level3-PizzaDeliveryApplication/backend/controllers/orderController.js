const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Step 1: user has built a pizza + seen the order summary. Create a Razorpay
// order (test mode) and our own pending Order document.
exports.createOrder = async (req, res) => {
  try {
    const { base, sauce, cheese, vegetables, amount } = req.body;
    if (!base || !sauce || !cheese || !Array.isArray(vegetables) || !amount) {
      return res.status(400).json({ error: 'base, sauce, cheese, vegetables[] and amount are required.' });
    }

    // amount is expected in rupees from the client; Razorpay wants paise.
    const amountPaise = Math.round(Number(amount) * 100);
    if (!amountPaise || amountPaise <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `order_rcpt_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.userId,
      base, sauce, cheese, vegetables,
      amount: amountPaise,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose to the client
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not create order.', detail: err.message });
  }
};

// Step 2: frontend Razorpay checkout succeeds (test mode) and posts back the
// payment id + signature. Verify the signature, mark paid, decrement stock.
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.userId });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed.' });
    }

    order.paid = true;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'Order Received';

    if (!order.stockDecremented) {
      await decrementStock(order);
      order.stockDecremented = true;
    }

    await order.save();
    res.json({ message: 'Payment verified. Order confirmed.', order });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.', detail: err.message });
  }
};

async function decrementStock(order) {
  const ops = [
    { filter: { type: 'base', name: order.base }, dec: 1 },
    { filter: { type: 'sauce', name: order.sauce }, dec: 1 },
    { filter: { type: 'cheese', name: order.cheese }, dec: 1 },
    ...order.vegetables.map(v => ({ filter: { type: 'vegetable', name: v }, dec: 1 })),
  ];
  for (const { filter, dec } of ops) {
    await Inventory.updateOne(filter, { $inc: { stock: -dec } });
  }
}

// User: their own orders, most recent first — used by the dashboard's polling.
exports.myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.userId, paid: true }).sort({ createdAt: -1 });
  res.json(orders);
};

// Admin: every order.
exports.allOrders = async (req, res) => {
  const orders = await Order.find({ paid: true }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

// Admin: update an order's status (Order Received -> In Kitchen -> Sent to Delivery).
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { ORDER_STATUSES } = require('../models/Order');
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Could not update status.', detail: err.message });
  }
};
