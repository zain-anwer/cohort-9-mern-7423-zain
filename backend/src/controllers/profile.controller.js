import profileService from "../services/profile.service.js"

export const profileNameChangeController = async (req,res,next) => {
    try {
        const {new_name} = req.body
        await profileService.profileNameChangeService(req.user.id,new_name)
        res.status(200).json({message:'Name Changed Successfully'})
    }
    catch (err)
    {
        next(err)
    }
}

export const profilePasswordChangeController = async (req,res,next) => {
    try {
        const {old_password,new_password} = req.body
        await profileService.profilePasswordChangeService(req.user.id,old_password,new_password)
        res.status(200).json({message:'Password Changed Successfully'})
    }
    catch(err) {
        next(err)
    }
}

export const profileDeleteController = async (req,res,next) => {
    try {
        await profileService.profileDeleteService(req.user.id)
        res.status(200).json({message: 'Account Deleted Successfully'})
    }
    catch(err) {
        next(err)
    }
}
       
export const profilePictureUpdateController = async (req,res,next) => {
    try {
        const image = req.file?.buffer
        const mimetype = req.file?.mimetype
        if (!image || !mimetype) {
            const err = new Error('Image Unavailable / Error Accessing Image')
            err.statusCode = 400
            throw err
        }
        await profileService.profilePictureUpdateService(req.user.id,image,mimetype)
        res.status(200).json({message: 'Profile Picture Updated Successfully'})
    }
    catch(err) {
        next(err)
    }
}

export const profilePictureDeleteController = async (req,res,next) => {
    try {
        await profileService.profilePictureDeleteService(req.user.id)
        res.status(200).json({message: 'Profile Picture Removed Successfully'})
    }
    catch(err) {
        next(err)
    }
}