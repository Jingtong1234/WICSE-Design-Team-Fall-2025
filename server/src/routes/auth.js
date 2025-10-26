const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Create Profile endpoint
router.post('/create-profile', async (req, res) => {
  try {
    const { username, email, phone, password, profilePicture } = req.body;

    // Validate required fields
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (username, email, phone, password, profile_picture) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, email, phone, profile_picture, created_at`,
      [username, email, phone, hashedPassword, profilePicture || null]
    );

    res.status(201).json({
      success: true,
      message: 'Profile created successfully!',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
});

// Placeholder login route
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

module.exports = router;