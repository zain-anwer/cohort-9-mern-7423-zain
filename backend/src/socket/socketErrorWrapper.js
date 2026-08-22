export const socketErrorWrapper = (handler) => {
    return ( async(socket,...args) => {
        try {
            await handler(socket,...args)
        }
        catch(err) {
            socket.emit('error',{
                message: err.message,
                code: err.statusCode || 500 
            })
        }
    })
}