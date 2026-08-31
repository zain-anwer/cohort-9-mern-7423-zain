import cloudinary from '../configs/cloudinary.js'
import userModel from '../models/users.model.js'
import { profileEvent } from '../events/profile.event.js'
import { getIO } from '../socket/socket.js'
import logger from '../configs/logger.js'
import bcrypt from 'bcrypt'

const profileNameChangeService = async (user_id,new_name) => {
    try {
        const user = await userModel.findOneAndUpdate(
            {'_id': user_id},
            {$set: {'name':new_name}},
            {new: true, runValidators: true}
        )
        profileEvent.emit('update:name',{user_id:user_id,new_name:new_name,updated_at:user.updatedAt})
    }
    catch(error) {
        const err = new Error('Error Updating Name')
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

    let user
    let match
    
    try {
        user = await userModel.findOne({'_id':user_id})
    }
    catch(error) {
        const err = new Error('Unable To Fetch User')
        err.statusCode = 500
        throw err
    }
    try {
        match = await bcrypt.compare(old_password,user.password)
    }
    catch(error) {
        const err = new Error('Error In Password Validation')
        err.statusCode = 500
        throw err
    }

    if (!match) {
        const err = new Error('Incorrect Password')
        err.statusCode = 401
        throw err
    }

    const encrypted_password = await bcrypt.hash(new_password,10)
    
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

    try {
        getIO().in(`user_id:${user_id}`).disconnectSockets(true)
    } catch (err) {
        logger.error({ err }, 'Failed to force-disconnect sockets after password change')
    }
}
const profileDeleteService = async (user_id) => {
    try {
        const user = await userModel.findOne({'_id': user_id})
        if (user.public_id) {
            await cloudinary.uploader.destroy(user.public_id)
        }
        await userModel.deleteOne({'_id': user_id})

        try {
            getIO().in(`user_id:${user_id}`).disconnectSockets(true)
        } catch (err) {
            logger.error({ err }, 'Failed to force-disconnect sockets after account deletion')
        }
    }
    catch (error) {
        const err = new Error('Error in deleting user account')
        err.statusCode = 500
        throw err
    }
}

const profilePictureUpdateService = async (user_id, image, mimetype) => {
    try {
        const dataUri = `data:${mimetype};base64,${image.toString('base64')}`
        const user = await userModel.findOne({ _id: user_id })
        const oldPublicId = user.public_id
        const { secure_url, public_id } =
        
        await cloudinary.uploader.upload(dataUri)

        const result = await userModel.findOneAndUpdate(
            { _id: user_id },
            {
                $set: {
                    profile_picture: secure_url,
                    public_id: public_id
                }
            },
            { new: true, runValidators: true }
        )
        profileEvent.emit('update:picture',{user_id:user_id,new_image:secure_url,updated_at:result.updatedAt})
        if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId)
        }
    }
    catch (error) {
        const err = new Error('Error updating profile picture')
        err.statusCode = 500
        throw err
    }
}

const profilePictureDeleteService = async (user_id) => {

    try {
        const user = await userModel.findOne({_id:user_id})
        
        if (user.public_id) {
            await cloudinary.uploader.destroy(user.public_id)
            const result = await userModel.findOneAndUpdate(
                {_id: user_id},
                {$set: {profile_picture:null,public_id:null}},
                {new: true, runValidators: true}
            )
            profileEvent.emit('delete:picture',{user_id:user_id,updated_at:result.updatedAt})
        }
    }
    catch(error) {
        const err = new Error('Error Deleting Profile Picture')
        err.statusCode = 500
        throw err
    }
}

export default {
    profileNameChangeService,
    profilePasswordChangeService,
    profileDeleteService,
    profilePictureUpdateService,
    profilePictureDeleteService
}