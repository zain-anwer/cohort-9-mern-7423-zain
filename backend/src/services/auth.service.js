import userModel from '../models/users.model.js'
import revokedTokenModel from '../models/token.model.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
dotenv.config()

const signupService = async (name,email,password) =>
{
    /* checking for missing fields in payload */
    /* typeof a missing field returns undefined so can be used here */
    if (typeof name != 'string' || typeof email != 'string' || typeof password != 'string')
    {
        const err = new Error('All Fields Required')
        err.statusCode = 400
        throw err
    }

    /* checking for empty strings in payload */
    name = name.trim()
    email = email.trim()
    password = password.trim()

    if (!name || !email || !password)
    {
        const err = new Error('All Fields Required')
        err.statusCode = 400                               
        throw err
    }

    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!email_regex.test(email))
    {
        const err = new Error('Invalid Email Pattern')
        err.statusCode = 400                                
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
    console.log('User created')
        
    /* unique identifier for jwt token */
    const jti = crypto.randomUUID()

    const access_token = jwt.sign(
        {userId: user_instance._id,jti: jti},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    )
       
    return access_token
}

const signinService = async (email,password) => {

    if (typeof email != 'string' || typeof password != 'string')
    {
        const err = new Error('All Fields Required')
        err.statusCode = 400
        throw err
    }

    email = email.trim()
    password = password.trim()
    if (email == '' || password == '')
    {
        const err = new Error('All Fields Required')
        err.statusCode = 400
        throw err
    }

    const user = await userModel.findOne({'email' : email})
    
    if (!user)
    {
        const err = new Error('Incorrect email or password')
        err.statusCode = 401
        throw err
    }
    
    const match = await bcrypt.compare(password,user.password)
    
    if (match)
        console.log('User Verified')
    else
    {
        const err = new Error('Incorrect email or password')
        err.statusCode = 401
        throw err
    }
    
    /* unique identifier for jwt token */
    const jti = crypto.randomUUID()

    const access_token = jwt.sign(
        {userId: user._id, jti: jti},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    )

    return access_token
}
 
const logoutService = async (token) => {
    
    const decoded = jwt.decode(token)

    if (decoded?.user_id && decoded?.exp){
        await revokedTokenModel.create({
            jti: decoded.jti,
            expiresAt: new Date(decoded.exp * 1000)
        })
    }
}

/*
- default javaScript objects are configurable allowing sinon.stub() to work on them
- namespace exotic objects are not configurable so using import * as authService from ... wouldn't have worked
*/

export default {
    signupService,
    signinService,
    logoutService
}