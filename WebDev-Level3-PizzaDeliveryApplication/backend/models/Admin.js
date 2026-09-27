const mongoose = require('mongoose');

// Admin accounts are separate from User accounts and are NOT created
// through the public registration flow (see seed.js / README).
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
