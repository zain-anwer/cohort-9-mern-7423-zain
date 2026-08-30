import cloudinary from '../configs/cloudinary.js'
import userModel from '../models/users.model.js'
import bcrypt from 'bcrypt'


const profilePictureUploadService = async (user_id, image) => {
    try {
        const result = await cloudinary.uploader.upload(image)
        await userModel.findOneAndUpdate(
            { _id: user_id },
            {
                $set: {
                    profile_picture: result.secure_url,
                    public_id: result.public_id
                }
            },
            { new: true, runValidators: true }
        )
    }
    catch (error) {
        const err = new Error('Error uploading profile picture')
        err.statusCode = 500
        throw err
    }
}

const profilePictureUpdateService = async (user_id, image) => {
    try {
        const user = await userModel.findOne({ _id: user_id })
        const oldPublicId = user.public_id
        const { secure_url, public_id } =
        
        await cloudinary.uploader.upload(image)

        await userModel.findOneAndUpdate(
            { _id: user_id },
            {
                $set: {
                    profile_picture: secure_url,
                    public_id: public_id
                }
            },
            { new: true, runValidators: true }
        )

        await cloudinary.uploader.destroy(oldPublicId)
    }
    catch (error) {
        const err = new Error('Error updating profile picture')
        err.statusCode = 500
        throw err
    }
}

const profilePictureDeleteService = async (user_id) => {

    try {
        const result = await userModel.findOne({_id:user_id})
        await cloudinary.uploader.destroy(result.public_id)
        await userModel.findOneAndUpdate(
            {_id: user_id},
            {$set: {profile_picture:null,public_id:null}},
            {new: true, runValidators: true}
        )
    }
    catch(error) {
        const err = new Error('Error Deleting Profile Picture')
        err.statusCode = 500
        throw err
    }
}

/* old and new passwords should not be the same */
/* new password should be at least 8 characters long */

const profilePasswordChangeService = async (user_id,old_password,new_password) => {
    
    if (old_password === new_password || new_password.length < 8)
    {
        const err = new Error('Please Enter Different Password')
        err.statusCode = 400
        throw err
    }

    const user = await userModel.findOne({'_id':user_id})
    const match = await bcrypt.compare(old_password,user.password)

    if (!match) {
        const err = new Error('Incorrect Password')
        err.statusCode = 401
        throw err
    }

    const encrypted_password = await bcrypt.hash(new_password,process.env.SALT_ROUNDS)
    
    try {
        await userModel.findOneAndUpdate(
            { _id:user_id },
            { $set: {password: encrypted_password} },
            { new: true, runValidators: true }
        )
    }
    catch(error) {
        const err = new Error('Error in updating password')
        err.statusCode = 500
        throw err
    }
}

const profileDeleteService = async (user_id) => {
    try {
        const user = await userModel.findOne({'_id': user_id})
        await userModel.deleteOne({'_id': user_id})
        await cloudinary.uploader.destroy(user.public_id)
    }
    catch (error) {
        const err = new Error('Error in deleting user account')
        err.statusCode = 500
        throw err
    }
}