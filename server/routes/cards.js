const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCard,
  getCards,
  updateCard,
  moveCard,
  deleteCard
} = require('../controllers/cardController');

router.post('/', auth, createCard);
router.get('/:column_id', auth, getCards);
router.put('/:id', auth, updateCard);
router.patch('/:id/move', auth, moveCard);
router.delete('/:id', auth, deleteCard);

module.exports = router;