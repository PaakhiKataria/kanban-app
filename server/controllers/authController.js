const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password_hash]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateProfile = async (req, res) => {
  const { name } = req.body
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at',
      [name, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    )
    const user = result.rows[0]

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const password_hash = await bcrypt.hash(newPassword, 10)
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, req.user.id]
    )

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
const deleteAccount = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id])
    res.json({ message: 'Account deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login, getProfile, updateProfile, updatePassword, deleteAccount }