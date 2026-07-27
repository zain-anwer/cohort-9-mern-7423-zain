import express from 'express'
import { signupController, signinController, logoutController } from '../controllers/auth.controller.js'

const router = express.Router()

router.get('/signup',signupController)
router.get('/signin',signinController)
router.get('/logout',logoutController)

export default router