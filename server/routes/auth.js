const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { register, login, getProfile, updateProfile, updatePassword, deleteAccount } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.get('/profile', auth, getProfile)
router.put('/profile', auth, updateProfile)
router.put('/password', auth, updatePassword)
router.delete('/account', auth, deleteAccount)

module.exports = router