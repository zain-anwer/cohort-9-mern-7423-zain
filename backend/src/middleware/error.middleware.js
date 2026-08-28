export const errorMiddleware = (err,req,res,next) => 
{
    /* GLOBAL ERROR HANDLING */

    req.log?.error(err)
    
    let statusCode = err.statusCode || 500
    let message

    if (err.name === 'CastError' || err.name === 'ValidationError') {
        statusCode = 400
        message = 'Invalid request data'
    }
    else {
        message = (statusCode < 500 && err.message) ? err.message : 'Internal Server Error' 
    }
    res.status(statusCode).json({'message' : message})
}