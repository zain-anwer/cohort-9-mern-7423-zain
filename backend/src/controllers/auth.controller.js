import authService from '../services/auth.service.js'

/* CURRENT MECHANISM FOR TOKEN TRANSFER AND LOGOUT
------------------------------------------------------------
1. the access token would be received on the client side 
2. it would be stored in local storage 
3. it would be added to authorization header for every subsequent request object */

export const signupController = async (req,res,next) =>
{
    try {
        console.log('signup endpoint reached')
 
        const {name, email, password} = req.body
        const access_token = await authService.signupService(name,email,password)
 
        return res.status(201).json({
            'status'       : 'Signup Successful',
            'access_token' : access_token
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
        console.log('signin endpoint reached')

        const {email,password} = req.body
        const access_token = await authService.signinService(email,password)
        
        return res.status(200).json({
            'status'       : 'Signin Successful',
            'access_token' : access_token
        })
    }
    catch(err)
    {
        next(err)
    }
}

export const logoutController = (req,res,next) =>
{
    /* 
        token deleted at frontend -- will implement redis blocklist later to 
        cater to deleted unexpired tokens 
    */

    try
    {
        console.log('logout endpoint reached')
        return res.status(200).json({'Message' : 'Logged Out Successfully'})
    }
    catch(err)
    {
        next(err)
    }
}