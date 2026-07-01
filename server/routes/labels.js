const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const pool = require('../config/db')

// Get labels for a card
router.get('/:card_id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM labels WHERE card_id = $1',
      [req.params.card_id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Add label to card
router.post('/', auth, async (req, res) => {
  const { card_id, text, color } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO labels (card_id, text, color) VALUES ($1, $2, $3) RETURNING *',
      [card_id, text, color]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete label
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM labels WHERE id = $1', [req.params.id])
    res.json({ message: 'Label deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router