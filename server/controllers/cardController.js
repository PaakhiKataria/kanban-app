const pool = require('../config/db');

// Create a card
const createCard = async (req, res) => {
  const { column_id, title, description, position, assignee_id, due_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cards (column_id, title, description, position, assignee_id, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [column_id, title, description, position, assignee_id, due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all cards for a column
const getCards = async (req, res) => {
  const { column_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT cards.*, users.name AS assignee_name
       FROM cards
       LEFT JOIN users ON cards.assignee_id = users.id
       WHERE cards.column_id = $1
       ORDER BY cards.position ASC`,
      [column_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a card (title, description, due_date, assignee)
const updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignee_id, due_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cards
       SET title = $1, description = $2, assignee_id = $3, due_date = $4
       WHERE id = $5 RETURNING *`,
      [title, description, assignee_id, due_date, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Move a card to a different column
const moveCard = async (req, res) => {
  const { id } = req.params;
  const { column_id, position } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cards SET column_id = $1, position = $2
       WHERE id = $3 RETURNING *`,
      [column_id, position, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a card
const deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM cards WHERE id = $1', [id]);
    res.json({ message: 'Card deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCard, getCards, updateCard, moveCard, deleteCard };