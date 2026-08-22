import { Server } from 'socket.io'
import { socketMiddleware } from '../middleware/socket.middleware.js'

let io = null

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {origin: process.env.CLIENT_URL, credentials: true}
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