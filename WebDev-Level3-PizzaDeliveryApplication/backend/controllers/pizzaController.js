const Pizza = require('../models/Pizza');

exports.list = async (req, res) => {
  const pizzas = await Pizza.find({}).sort({ name: 1 });
  res.json(pizzas);
};
