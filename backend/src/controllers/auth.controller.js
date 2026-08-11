import userModel from '../models/users.model.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

export const signupController = async (req,res,next) =>
{
    try {
        console.log('signup endpoint reached')

        /* preventing email duplication and raising meaningful error */
        const existingUser = await userModel.findOne({email: req.body.email})

        if (existingUser)
        {
            const err = new Error('Email Already Exists')
            err.statusCode = 409 // status code for conflict
            throw err
        }

        const password_hashed = await bcrypt.hash(req.body.password,10)
        const user_instance = await userModel.create({...req.body,password: password_hashed})
        console.log('User created:')
        console.log(user_instance)
        
        /* token creation -- using authorization header communication mechanism */
        const access_token = jwt.sign(
            {userId: user_instance._id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )
        
        /* 1. the access token would be received on the client side */
        /* 2. it would be stored in local storage */
        /* 3. it would be added to authorization header for every subsequent request object */
        return res.json({
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

        const user = await userModel.findOne({email:req.body.email})
        if (!user)
        {
            const err = new Error('Incorrect Email')
            err.statusCode = 401
            throw err
        }

        const match = await bcrypt.compare(req.body.password,user.password)

        if (match)
            console.log('User Verified')
        else
        {
            const err = new Error('Incorrect Password')
            err.statusCode = 401
            throw err
        }

        /* token creation -- using authorization header communication mechanism */
        const access_token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )
        
        /* 1. the access token would be received on the client side */
        /* 2. it would be stored in local storage */
        /* 3. it would be added to authorization header for every subsequent request object */
        return res.json({
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
        return res.json({'Message' : 'Logout Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}