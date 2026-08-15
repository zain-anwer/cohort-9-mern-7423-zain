export const errorMiddleware = (err,req,res,next) => 
{
    /* GLOBAL ERROR HANDLING */

    req.log?.error(err)
    const statusCode = err.statusCode || 500    
    const message = (statusCode < 500 && err.message) ? err.message : 'Internal Server Error' 
    res.status(statusCode).json({'message' : message})
}