import { profileEvent } from "../../events/profile.event.js";
import { getIO } from "../socket.js";
import logger from "../../configs/logger.js"

profileEvent.on('update:name',({user_id,new_name,updated_at}) => {
    try {
        getIO().to(`user_id:${user_id}`).emit('name:updation',new_name,updated_at)
    } catch (err) {
        logger.error({ err }, 'Failed to broadcast name update')
    }
})

profileEvent.on('update:picture',({user_id,new_image,updated_at}) => {
    try {
        getIO().to(`user_id:${user_id}`).emit('picture:updation',new_image,updated_at)
    } catch (err) {
        logger.error({ err }, 'Failed to broadcast picture update')
    }
})

profileEvent.on('delete:picture',({user_id,updated_at}) => {
    try {
        getIO().to(`user_id:${user_id}`).emit('picture:deletion',updated_at)
    } catch (err) {
        logger.error({ err }, 'Failed to broadcast picture deletion')
    }
})