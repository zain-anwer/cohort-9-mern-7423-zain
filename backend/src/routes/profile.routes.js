import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/auth.middleware.js'
import {profileNameChangeController, profilePasswordChangeController,
    profileDeleteController,
    profilePictureUpdateController, profilePictureDeleteController
} from '../controllers/profile.controller.js'

/* multer middleware to store form data (image etc) in req.file */
const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ]

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(Object.assign(new Error('Only JPEG, PNG and WebP images are allowed'), { statusCode: 400 }), false)
        }
    }
})

const router = express.Router()

/* since all these will be protected routes as welllll */
router.use(authMiddleware)

router.put('/name',profileNameChangeController)
router.put('/password',profilePasswordChangeController)
router.delete('/',profileDeleteController)
router.put('/picture',upload.single('file'),profilePictureUpdateController)
router.delete('/picture',profilePictureDeleteController)

export default router