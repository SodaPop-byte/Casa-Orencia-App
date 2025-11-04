const express = require('express');
const router = express.Router(); // <-- THIS WAS THE MISSING LINE!
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- SIGNUP / REGISTER (UPDATED) ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, birthday } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      birthday: birthday || null,
      role: role || 'reseller'
    });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const secret = process.env.JWT_SECRET || "mysecretkey";
    
    jwt.sign(
      payload,
      secret,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;