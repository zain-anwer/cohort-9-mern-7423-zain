import authService from '../services/auth.service.js'

/* CURRENT MECHANISM FOR TOKEN TRANSFER AND LOGOUT
------------------------------------------------------------
1. the access token would be received on the client side 
2. it would be stored in local storage 
3. it would be added to authorization header for every subsequent request object */

export const signupController = async (req,res,next) =>
{
    try {
        const {name, email, password} = req.body ?? {}
        const {access_token,user} = await authService.signupService(name,email,password)
 
        req.log.info(
            { userId: user._id },
            'User signup successful'
        )

        return res.status(201).json({
            'status'       : 'Signup Successful',
            'access_token' : access_token,
            'user'         : user
        })
    }
    catch(err)
    {
        next(err)
    }
}

export const signinController = async (req,res,next) =>
{
    try
    {
        const {email,password} = req.body ?? {}
        const {access_token, user} = await authService.signinService(email,password)
        
        req.log.info(
            { userId: user._id },
            'User signin successful'
        )

        return res.status(200).json({
            'status'       : 'Signin Successful',
            'access_token' : access_token,
            'user': user
        })
    }
    catch(err)
    {
        next(err)
    }
}

export const logoutController = async (req,res,next) =>
{
    /* creating a token and passing it to the service that adds it to the revoked token document in database */

    try
    {
        const [scheme,token] = req.headers.authorization?.split(' ') ?? []
        if (scheme != 'Bearer' || !token)
        {
            const err = new Error('Authorization Token Missing')
            err.statusCode = 401
            throw err
        }
        await authService.logoutService(token)
        
        req.log.info(
            'User logged out successfully'
        )

        return res.status(200).json({'Message' : 'Logged Out Successfully'})
    }
    catch(err)
    {
        next(err)
    }
}