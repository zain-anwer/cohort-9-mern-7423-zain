import {signupService,signinService} from '../services/auth.service.js'

export const signupController = async (req,res,next) =>
{
    try {
        console.log('signup endpoint reached')

        const {name, email, password} = req.body

        /* invoking signup service */
        const access_token = await signupService(name,email,password)
        
        /* 1. the access token would be received on the client side */
        /* 2. it would be stored in local storage */
        /* 3. it would be added to authorization header for every subsequent request object */
        return res.status(201).json({
            'status'       : 'SignUp Successful',
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
        const access_token = await signinService(email,password)
        
        /* 1. the access token would be received on the client side */
        /* 2. it would be stored in local storage */
        /* 3. it would be added to authorization header for every subsequent request object */
        return res.status(200).json({
            'status'       : 'SignIn Successful',
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