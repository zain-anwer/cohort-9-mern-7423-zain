import { io } from 'socket.io-client'

let socket = null

export const connectSocket = (token) => {
   
    /* tells us whether it exists and if so it is connectedd */
    if (socket) {
        if (socket.auth?.token === token)
            return socket
        socket.disconnect()
        socket = null
    }

    socket = io(import.meta.env.VITE_BACKEND_URL,{ auth:{ token } })
    return socket
}

export const disconnectSocket = () => {
    if (!socket)
        return 
    socket.disconnect()
    socket = null
}

/* apparently if you don't put curly braces you are returning the entire thing */
export const getSocket = () => socket

