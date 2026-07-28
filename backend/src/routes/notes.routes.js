import express from 'express'
import { createNoteController, 
    updateNoteController, deleteNoteController, 
    getNoteController, getAllNotesController } 
    from '../controllers/notes.controller.js'

const router = express.Router()

router.post('/',createNoteController)
router.get('/:id',getNoteController)
router.get('/',getAllNotesController)
router.put('/:id',updateNoteController)
router.delete('/:id',deleteNoteController)

export default router