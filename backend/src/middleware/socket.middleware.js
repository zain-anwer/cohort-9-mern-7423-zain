import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const socketMiddleware = (socket,next) => {

    try {
        const token = socket.handshake.auth?.token

        if (!token)
        {
            const error = new Error('Token Missing')
            error.statusCode = 401
            return next(error)
        }

        const payload = jwt.verify(token,process.env.JWT_SECRET)
        socket.user = { id: payload.userId}
        next()
    }
    catch (err) {
        const error = new Error('Invalid Token')
        error.statusCode = 401
        return next(error)
    }
} 