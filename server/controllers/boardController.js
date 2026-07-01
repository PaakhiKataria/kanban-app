const pool = require('../config/db');

// Create a board
const createBoard = async (req, res) => {
  const { name } = req.body;
  const owner_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, owner_id]
    );

    const board = result.rows[0];

    // Add owner as a member with role 'owner'
    await pool.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [board.id, owner_id, 'owner']
    );

    res.status(201).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all boards for logged in user
const getBoards = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT b.* FROM boards b
       INNER JOIN board_members bm ON b.id = bm.board_id
       WHERE bm.user_id = $1
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single board
const getBoard = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Check user is a member
    const member = await pool.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const board = await pool.query(
      'SELECT * FROM boards WHERE id = $1',
      [id]
    );

    res.json(board.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a board
const deleteBoard = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Only owner can delete
    const board = await pool.query(
      'SELECT * FROM boards WHERE id = $1 AND owner_id = $2',
      [id, user_id]
    );

    if (board.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.query('DELETE FROM boards WHERE id = $1', [id]);

    res.json({ message: 'Board deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getActivity = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'SELECT * FROM activity_log WHERE board_id = $1 ORDER BY created_at DESC LIMIT 20',
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const addActivity = async (req, res) => {
  const { id } = req.params
  const { action } = req.body
  const user_id = req.user.id
  try {
    const result = await pool.query(
      'INSERT INTO activity_log (board_id, user_id, action) VALUES ($1, $2, $3) RETURNING *',
      [id, user_id, action]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
const updateBoard = async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  const user_id = req.user.id

  try {
    const result = await pool.query(
      'UPDATE boards SET name = $1 WHERE id = $2 AND owner_id = $3 RETURNING *',
      [name, id, user_id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createBoard, getBoards, getBoard, deleteBoard, getActivity, addActivity, updateBoard }