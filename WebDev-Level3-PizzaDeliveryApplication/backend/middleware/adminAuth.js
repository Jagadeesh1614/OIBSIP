const jwt = require('jsonwebtoken');

// Separate secret from the user JWT, so a user token can never pass as an admin token.
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (!payload.isAdmin) return res.status(403).json({ error: 'Admin access required.' });
    req.adminId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
}

module.exports = requireAdmin;
