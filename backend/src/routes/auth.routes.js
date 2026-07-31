import express from 'express'
import { signupController, signinController, logoutController } from '../controllers/auth.controller.js'

const router = express.Router()

/* signin and logout post because get appends data directly to url */

router.post('/signup',signupController)
router.post('/signin',signinController)
router.post('/logout',logoutController)

export default router