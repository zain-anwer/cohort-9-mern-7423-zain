 export const signupController = (req,res,next) =>
{
    try {
        console.log('signup endpoint reached')
        return res.json({'Message' : 'Signup Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const signinController = (req,res) =>
{
    try
    {
        console.log('signin endpoint reached')
        return res.json({'Message' : 'Signin Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const logoutController = (req,res) =>
{
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