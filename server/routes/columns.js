const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn
} = require('../controllers/columnController');

router.post('/', auth, createColumn);
router.get('/:board_id', auth, getColumns);
router.put('/:id', auth, updateColumn);
router.delete('/:id', auth, deleteColumn);

module.exports = router;