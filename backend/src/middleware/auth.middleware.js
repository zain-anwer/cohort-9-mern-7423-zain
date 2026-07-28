import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

export const authMiddleware = (req,res,next) => {
    
    /* authenticates protected APIs by checking token in auth header */

    authHeader = req.headers.authorization
    if (!authHeader)
        next(new AppError('Authorization Header Missing',401))

    /* req['headers']['authorization'] = 'Bearer <TOKEN>' */
    token = authHeader.split(' ')[0]

    payload = jwt.verify(token,process.env.JWT_SECRET)

    if (!payload)
        next(new AppError('Invalid or Expired Token',401))
    
    /* append the user id to req object after extraction for controller level verification */
    req.user.id = payload.userId 
}