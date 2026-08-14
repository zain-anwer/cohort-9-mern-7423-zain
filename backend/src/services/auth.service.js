import userModel from '../models/users.model.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

const signupService = async (name,email,password) =>
{
    /* checking for empty payload */
    name = name.trim()
    email = email.trim()
    password = password.trim()

    if (!name || !email || !password)
    {
        const err = new Error('All Fields Required')
        err.statusCode = 400                                // bad request
        throw err
    }

    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!email_regex.test(email))
    {
        const err = new Error('Invalid Email Pattern')
        err.statusCode = 400                                // bad request
        throw err
    }

    if (password.length < 8)
    {
        const err = new Error('Password should be at least 8 characters long')
        err.statusCode = 400
        throw err
    }

    /* preventing email duplication and raising meaningful error */
    const existingUser = await userModel.findOne({'email': email})

    if (existingUser)
    {
        const err = new Error('Email Already Exists')
        err.statusCode = 409                               // status code for conflict
        throw err
    }

    const password_hashed = await bcrypt.hash(password,10)
    const user_instance = await userModel.create({name: name,email: email,password: password_hashed})
    console.log('User created:')
    console.log(user_instance)
        
    /* token creation -- using authorization header communication mechanism */
    const access_token = jwt.sign(
        {userId: user_instance._id},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    )
       
    return access_token
}

const signinService = async (email,password) => {
       
    const user = await userModel.findOne({'email' : email})
    
    if (!user)
    {
        const err = new Error('Incorrect / Unregistered Email')
        err.statusCode = 401
        throw err
    }
    
    const match = await bcrypt.compare(password,user.password)
    
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

    return access_token
}


/*
- default javaScript objects are configurable allowing sinon.stub() to work on them
- namespace exotic objects are not configurable so using import * as authService from ... wouldn't have worked
*/

export default {
    signupService,
    signinService
}