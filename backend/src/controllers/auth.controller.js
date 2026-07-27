 
export const signupController = (req,res) =>
{
    console.log('signup endpoint reached')
    return res.json({'Message' : 'Signup Controller Working'})
}

export const signinController = (req,res) =>
{
    console.log('signin endpoint reached')
    return res.json({'Message' : 'Signin Controller Working'})
}

export const logoutController = (req,res) =>
{
    console.log('logout endpoint reached')
    return res.json({'Message' : 'Logout Controller Working'})
}