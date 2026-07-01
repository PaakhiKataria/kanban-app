const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  createBoard,
  getBoards,
  getBoard,
  deleteBoard,
  getActivity,
  addActivity,
  updateBoard
} = require('../controllers/boardController')

router.post('/', auth, createBoard)
router.get('/', auth, getBoards)
router.get('/:id', auth, getBoard)
router.delete('/:id', auth, deleteBoard)
router.get('/:id/activity', auth, getActivity)
router.post('/:id/activity', auth, addActivity)
router.put('/:id', auth, updateBoard)

module.exports = router