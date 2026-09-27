require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Inventory = require('./models/Inventory');
const Pizza = require('./models/Pizza');

async function seed() {
  await connectDB();

  // --- Admin account (this is the ONLY way an admin gets created) ---
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@pizzaapp.com').toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123', 12);
    await Admin.create({ name: 'Admin', email: adminEmail, passwordHash });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  // --- Inventory: 5 bases, 5 sauces, a few cheeses, a few vegetables ---
  const items = [
    ...['Thin Crust', 'Classic Hand-Tossed', 'Cheese Burst', 'Whole Wheat', 'Gluten-Free'].map(name => ({ type: 'base', name })),
    ...['Tomato Basil', 'Peri-Peri', 'BBQ', 'White Garlic', 'Pesto'].map(name => ({ type: 'sauce', name })),
    ...['Mozzarella', 'Cheddar', 'Vegan Cheese', 'Extra Mozzarella'].map(name => ({ type: 'cheese', name })),
    ...['Onion', 'Capsicum', 'Mushroom', 'Corn', 'Jalapeno', 'Black Olives', 'Tomato'].map(name => ({ type: 'vegetable', name })),
  ];
  for (const it of items) {
    await Inventory.updateOne(
      { type: it.type, name: it.name },
      { $setOnInsert: { stock: 50, threshold: Number(process.env.LOW_STOCK_THRESHOLD || 20) } },
      { upsert: true }
    );
  }
  console.log(`Inventory seeded/verified: ${items.length} items.`);

  // --- A couple of preset menu pizzas for the dashboard ---
  const presetCount = await Pizza.countDocuments();
  if (presetCount === 0) {
    await Pizza.insertMany([
      { name: 'Margherita', description: 'Classic tomato, mozzarella and basil.', price: 249 },
      { name: 'Farmhouse', description: 'Onion, capsicum, mushroom, corn.', price: 329 },
      { name: 'Peri-Peri Paneer', description: 'Spicy peri-peri sauce with paneer.', price: 349 },
    ]);
    console.log('Preset menu seeded.');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
