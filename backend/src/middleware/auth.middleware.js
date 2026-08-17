import revokedNoteModel from '../models/token.model.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

const authMiddleware = async (req,res,next) => {
    
    /* authenticates protected APIs by checking token in auth header */

    const authHeader = req.headers.authorization
    if (!authHeader)
    {
        const err = new Error('Authorization Header Missing')
        err.statusCode = 401
        return next(err)
    }

    /* req['headers']['authorization'] = 'Bearer <TOKEN>' */
    const [scheme,token] = authHeader.split(' ')

    if (scheme != 'Bearer' || !token) {
        const err = new Error('Invalid Authorization Header')
        err.statusCode = 401
        return next(err)
    }

    var payload = null
    try {
        payload = jwt.verify(token,process.env.JWT_SECRET)
    }
    catch(err) {
        err.statusCode = 401
        return next(err)
    }

    /* validating payload body to contain both userId and jti */
    if (typeof payload?.jti != 'string' || typeof payload?.userId != 'string' && !payload?.userId) {
        const err = new Error('Invalid Token')
        err.statusCode = 401
        return next(err)
    }

    try {
        const result = await revokedNoteModel.findOne({jti: payload.jti})
        if (result) {
            const err = new Error('Unauthorized Access - token has been revoked')
            err.statusCode = 401
            return next(err)
        }
    }
    catch(err) {
        return next(err)
    }
    
    /* append the user id to req object after extraction for controller level verification */
    req.user = {}
    req.user.id = payload.userId 

    next()
}

export default authMiddleware