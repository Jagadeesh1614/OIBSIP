const Inventory = require('../models/Inventory');

// Public: pizza-builder options grouped by type, in-stock items only.
exports.getOptions = async (req, res) => {
  const items = await Inventory.find({ stock: { $gt: 0 } }).sort({ name: 1 });
  const group = t => items.filter(i => i.type === t).map(i => ({ id: i._id, name: i.name, stock: i.stock }));
  res.json({
    bases: group('base'),
    sauces: group('sauce'),
    cheeses: group('cheese'),
    vegetables: group('vegetable'),
  });
};

// Admin: full inventory dashboard (includes out-of-stock items).
exports.getAllInventory = async (req, res) => {
  const items = await Inventory.find({}).sort({ type: 1, name: 1 });
  res.json(items);
};

// Admin: manual stock update for one item.
exports.updateStock = async (req, res) => {
  try {
    const { stock, threshold } = req.body;
    const update = {};
    if (stock !== undefined) update.stock = Math.max(0, Number(stock));
    if (threshold !== undefined) update.threshold = Math.max(0, Number(threshold));
    if (update.stock !== undefined) update.lowStockAlerted = false; // let the cron re-alert if it dips again

    const item = await Inventory.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Inventory item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Could not update stock.', detail: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { type, name, stock, threshold } = req.body;
    if (!['base', 'sauce', 'cheese', 'vegetable'].includes(type)) {
      return res.status(400).json({ error: 'Invalid item type.' });
    }
    const item = await Inventory.create({ type, name, stock: stock || 0, threshold: threshold || 20 });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Could not create item.', detail: err.message });
  }
};
