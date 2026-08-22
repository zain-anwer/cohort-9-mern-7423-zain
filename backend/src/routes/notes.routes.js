import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/auth.middleware.js'
import { createNoteController, 
    updateNoteController, deleteNoteController, 
    getNoteController, getAllNotesController, 
    exportNoteController, importNoteController} 
    from '../controllers/notes.controller.js'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/plain') {
            return cb(new Error('Only TXT files are allowed'))
        }

        cb(null, true)
    }
})

const router = express.Router()

/* all note routes must use authentication -- should have jwt token */
router.use(authMiddleware)

router.post('/',createNoteController)
router.get('/:id',getNoteController)
router.get('/',getAllNotesController)
router.put('/:id',updateNoteController)
router.delete('/:id',deleteNoteController)
router.get('/export/:id',exportNoteController)
router.post('/import',upload.single('file'),importNoteController)

export default router