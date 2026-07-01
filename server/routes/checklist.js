const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const pool = require('../config/db')

// Get checklist for a card
router.get('/:card_id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM checklist_items WHERE card_id = $1 ORDER BY position ASC',
      [req.params.card_id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Add checklist item
router.post('/', auth, async (req, res) => {
  const { card_id, text, position } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO checklist_items (card_id, text, position) VALUES ($1, $2, $3) RETURNING *',
      [card_id, text, position]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Toggle checklist item
router.patch('/:id', auth, async (req, res) => {
  const { completed } = req.body
  try {
    const result = await pool.query(
      'UPDATE checklist_items SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete checklist item
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM checklist_items WHERE id = $1', [req.params.id])
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router