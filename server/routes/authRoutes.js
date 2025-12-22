import express from 'express'
import { loginUser, registerUser, getAllUsers, resetUserPassword } from '../controllers/authController.js'

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/users', getAllUsers)
router.post('/reset-password', resetUserPassword)

export default router

