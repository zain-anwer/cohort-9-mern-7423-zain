import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import { createNoteController, 
    updateNoteController, deleteNoteController, 
    getNoteController, getAllNotesController } 
    from '../controllers/notes.controller.js'

const router = express.Router()

/* all note routes must use authentication -- should have jwt token */
router.user(authMiddleware)

router.post('/',createNoteController)
router.get('/:id',getNoteController)
router.get('/',getAllNotesController)
router.put('/:id',updateNoteController)
router.delete('/:id',deleteNoteController)

export default router