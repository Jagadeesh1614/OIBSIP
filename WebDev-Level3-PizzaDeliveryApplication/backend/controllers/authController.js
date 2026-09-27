const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { generateToken } = require('../utils/token');

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour for both verify + reset links

function signUserToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are all required.' });
    }
    if (password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters and include a number.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = generateToken();

    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash,
      verifyToken, verifyTokenExpires: Date.now() + TOKEN_TTL_MS,
    });

    const link = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your Pizza App account',
      html: `<p>Hi ${name},</p><p>Confirm your email to activate your account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
    });

    res.status(201).json({ message: 'Registered. Check your email to verify your account before logging in.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', detail: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), verifyToken: token });
    if (!user || user.verifyTokenExpires < Date.now()) {
      return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
    }
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.', detail: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    // Same generic error for "no such user" and "wrong password" — never reveal which.
    const genericError = { error: 'Incorrect email or password.' };
    if (!user) return res.status(401).json(genericError);

    const match = await bcrypt.compare(password || '', user.passwordHash);
    if (!match) return res.status(401).json(genericError);

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = signUserToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', detail: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    // Always respond the same way, whether or not the account exists, to avoid leaking which emails are registered.
    if (user) {
      const resetToken = generateToken();
      user.resetToken = resetToken;
      user.resetTokenExpires = Date.now() + TOKEN_TTL_MS;
      await user.save();

      const link = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
      await sendEmail({
        to: user.email,
        subject: 'Reset your Pizza App password',
        html: `<p>Reset your password using the link below (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`,
      });
    }
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not process request.', detail: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!password || password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters and include a number.' });
    }
    const user = await User.findOne({ email: (email || '').toLowerCase(), resetToken: token });
    if (!user || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired.' });
    }
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not reset password.', detail: err.message });
  }
};
