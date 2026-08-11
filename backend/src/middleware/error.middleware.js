export const errorMiddleware = (err,req,res,next) => 
{
    /* GLOBAL ERROR HANDLING */

    req.log?.error(err)
    res.status(err.statusCode || 500).json({'message' : err.message || 'Internal Server Error'})
}