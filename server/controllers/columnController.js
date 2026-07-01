const pool = require('../config/db');

// Create a column
const createColumn = async (req, res) => {
  const { board_id, title, position } = req.body;
  const user_id = req.user.id;

  try {
    // Check user is a board member
    const member = await pool.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [board_id, user_id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      'INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3) RETURNING *',
      [board_id, title, position]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all columns for a board
const getColumns = async (req, res) => {
  const { board_id } = req.params;
  const user_id = req.user.id;

  try {
    // Check user is a board member
    const member = await pool.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [board_id, user_id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT * FROM columns WHERE board_id = $1 ORDER BY position ASC',
      [board_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a column
const updateColumn = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const result = await pool.query(
      'UPDATE columns SET title = $1 WHERE id = $2 RETURNING *',
      [title, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a column
const deleteColumn = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM columns WHERE id = $1', [id]);
    res.json({ message: 'Column deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createColumn, getColumns, updateColumn, deleteColumn };