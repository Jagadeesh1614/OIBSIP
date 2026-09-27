const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// No admin-registration endpoint is exposed here on purpose — admin accounts
// are created only via `npm run seed` / directly in the database (see README).
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: (email || '').toLowerCase() });
    const genericError = { error: 'Incorrect email or password.' };
    if (!admin) return res.status(401).json(genericError);

    const match = await bcrypt.compare(password || '', admin.passwordHash);
    if (!match) return res.status(401).json(genericError);

    const token = jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_ADMIN_SECRET, { expiresIn: '12h' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', detail: err.message });
  }
};
