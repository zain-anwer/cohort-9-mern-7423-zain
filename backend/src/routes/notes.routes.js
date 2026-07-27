import express from 'express'
import { createController, updateController, deleteController, readController } from '../controllers/notes.controller.js'

const router = express.Router()

router.get('/create',createController)
router.get('/update',updateController)
router.get('/delete',deleteController)
router.get('/read',readController)

export default router