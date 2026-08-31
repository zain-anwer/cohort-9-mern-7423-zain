import cloudinary from '../configs/cloudinary.js'
import userModel from '../models/users.model.js'
import { profileEvent } from '../events/profile.event.js'
import { getIO } from '../socket/socket.js'
import logger from '../configs/logger.js'
import bcrypt from 'bcrypt'

const profileFetchService = async (user_id) => {
    let user

    try {
        user = await userModel.findOne({_id:user_id})
    }
    catch(error) {
        const err = new Error('Error Accessing User Record')
        err.statusCode = 500
        throw err
    }

    if (!user) {
        const err = new Error('User Not Found')
        err.statusCode = 404
        throw err
    }

    return {name:user.name,email:user.email,profile_picture:user.profile_picture}
}

const profileNameChangeService = async (user_id,new_name) => {

    if (typeof new_name !== 'string' || !new_name.trim()) {
        const err = new Error('Invalid Name')
        err.statusCode = 400
        throw err
    }

    let user

    try {
        user = await userModel.findOneAndUpdate(
            {'_id': user_id},
            {$set: {'name':new_name}},
            {new: true, runValidators: true}
        )
    }
    catch(error) {
        const err = new Error('Error Updating Name')
        err.statusCode = 500
        throw err
    }

    if (!user) {
        const err = new Error('User Not Found')
        err.statusCode = 404
        throw err
    }

    profileEvent.emit('update:name',{user_id:user_id,new_name:new_name,updated_at:user.updatedAt})
}

/* old and new passwords should not be the same */
/* new password should be at least 8 characters long */

const profilePasswordChangeService = async (user_id,old_password,new_password) => {
    
    if (typeof old_password !== 'string' || typeof new_password !== 'string' || old_password === new_password || new_password.length < 8)
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

    if (!user) {
        const err = new Error('User Not Found')
        err.statusCode = 404
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

    let encrypted_password

    try {
        encrypted_password = await bcrypt.hash(new_password,10)
    }
    catch(error) {
        const err = new Error('Error In Password Encryption')
        err.statusCode = 500
        throw err
    }
    
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
    let user

    try {
        user = await userModel.findOne({'_id': user_id})
    }
    catch (error) {
        const err = new Error('Error in deleting user account')
        err.statusCode = 500
        throw err
    }

    if (!user) {
        const err = new Error('User Not Found')
        err.statusCode = 404
        throw err
    }

    try {
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
    let user

    try {
        const dataUri = `data:${mimetype};base64,${image.toString('base64')}`
        user = await userModel.findOne({ _id: user_id })
    }
    catch (error) {
        const err = new Error('Error updating profile picture')
        err.statusCode = 500
        throw err
    }

    if (!user) {
        const err = new Error('User Not Found')
        err.statusCode = 404
        throw err
    }

    try {
        const oldPublicId = user.public_id
        const { secure_url, public_id } = await cloudinary.uploader.upload(dataUri)

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
            try {
                await cloudinary.uploader.destroy(oldPublicId)
            }
            catch (err) {
                logger.error({ err }, 'Failed to clean up old profile picture')
            }
        }
        return secure_url
    }
    catch (error) {
        const err = new Error('Error updating profile picture')
        err.statusCode = 500
        throw err
    }
}

const profilePictureDeleteService = async (user_id) => {

    let user

    try {
        user = await userModel.findOne({_id:user_id})
    }
    catch(error) {
        const err = new Error('Error Deleting Profile Picture')
        err.statusCode = 500
        throw err
    }

    if (!user) {
        const err = new Error('User Not Found')
        err.statusCode = 404
        throw err
    }
    
    try {
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
    profileFetchService,
    profileNameChangeService,
    profilePasswordChangeService,
    profileDeleteService,
    profilePictureUpdateService,
    profilePictureDeleteService
}