import { Server } from 'socket.io'
import { socketMiddleware } from '../middleware/socket.middleware.js'
import dotenv from 'dotenv'

dotenv.config()

let io = null

const CLIENT_URL = process.env.CLIENT_URL

if (!CLIENT_URL) {
    throw new Error('CLIENT_URL environment variable is required')
}

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {origin: CLIENT_URL}
    })

    io.use(socketMiddleware)
    io.on('connection',(socket) => {
        try {
            /* per user_id rooms so all devices get a broadcast on updates :) */
            socket.join(`user_id:${socket.user.id}`)

            /* apparently socket disconnects from the room by itself so nothing to do here yay! */
            socket.on('disconnect',() => {})
        }
        catch(error) {
            socket.emit('error',{message: 'Connection Setup Failed', code: 500})
            socket.disconnect(true)
        }
    })
    return io
}

export const getIO = () => {
    if (!io) {
        const error = new Error('Socket Uninitialized')
        error.statusCode = 500
        throw error
    }
    return io
}

