import { useState } from 'react'  
import toast from 'react-hot-toast'  
import useAuthStore from '../stores/authStore'  
import { useLocation, useNavigate } from 'react-router-dom'  
import { LoaderCircle, NotebookPen, Eye, EyeOff, Mail, User } from 'lucide-react'  
  
export const AuthPage = () => {  
  
    const navigate = useNavigate()  
    const location = useLocation() 
 
    const signin = useAuthStore((state) => state.signin)  
    const signup = useAuthStore((state) => state.signup)  
    const isLoading = useAuthStore((state) => state.isLoading)  
  
    /* component specific states to build user object for api call :) */  
    const isSigninPage = location.pathname === '/signin'  
    const [name,setName] = useState("")  
    const [email,setEmail] = useState("")  
    const [password,setPassword] = useState("")  
    const [showPassword,setShowPassword] = useState(false)
  
    const handleName = (e) => {  
        setName(e.target.value)  
    }  
    const handleEmail = (e) => {  
        setEmail(e.target.value)  
    }  
    const handlePassword = (e) => {  
        setPassword(e.target.value)  
    }  
  
    const handleSubmit = async (e) => {  
          
        /* this prevent's the page from reloading immediately */  
        /* hence important cause otherwise we won't be able to make an API call */  
        e.preventDefault()  
  
        /* normalization cause I will be empty strings with spaces will otherwise be truthy */  
        /* can't simply use  */  
        const user_name = name.trim()  
        const user_email = email.trim()  
        const user_password = password 
  
        if (!user_email || !user_password)  
            toast.error('All Fields Required')  
        else if (!isSigninPage && !user_name)  
            toast.error('All Fields Required')  
        else {  
            try {  
                if (!isSigninPage)  
                    await signup({name:user_name,email:user_email,password:user_password})  
                else  
                    await signin({email:user_email,password:user_password})  
                toast.success(`${isSigninPage? 'signin':'signup'} successful`)  
                navigate('/dashboard')  
            }  
            catch(err) {  
                toast.error(err.response?.data?.message || 'something went wrong')  
            }  
        }  
    }  
  
    return (  
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 overflow-hidden">  
 
            <img  
                src="/doodle-bg.png"  
                alt=""  
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"  
            /> 
 
            <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">  
 
                <div className="flex items-center justify-center gap-2 mb-6"> 
                    <NotebookPen size={24} className="text-gray-900" /> 
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900"> 
                        Scribble 
                    </h1> 
                </div> 
 
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">  
                    {  
                        !isSigninPage ?  
                        (  
                        <>  
                            <div className="flex flex-col gap-1">  
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>  
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                    <input id="name" type='text' value={name} onChange={handleName}   
                                    placeholder='Rene Descartes' className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />  
                                </div>
                            </div>  
                        </>  
                        ) : <></>      
                    }  
                    <div className="flex flex-col gap-1">  
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>  
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                            <input id="email" type='email' value={email} onChange={handleEmail} placeholder='rene.descartes@gmail.com' className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"/>
                        </div>
                    </div>  
                    <div className="flex flex-col gap-1">  
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>  
                        <div className="relative">
                            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={handlePassword} className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"/>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>  
                    <button type="submit" disabled={isLoading} className="mt-1 flex w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2.5 text-sm sm:text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">  
                    {  
                        isLoading ?  
                        (<LoaderCircle className='animate-spin' size={18}/>)  
                        :  
                        (isSigninPage? "signin" : "signup")  
                    }  
                    </button>  
                  
                    {  
                        isSigninPage ? (  
                            <p className="text-center text-sm text-gray-500">  
                                Don't have an account?{" "}  
                                <button
                                type="button"
                                onClick={() => {  
                                    navigate('/signup'); 
                                    setEmail("") 
                                    setPassword("") 
                                    setName("")   
                                }}  
                                className="font-medium text-gray-900 hover:underline">  
                                sign up  
                                </button>  
                            </p>
                        ) : (  
                            <p className="text-center text-sm text-gray-500">  
                                Already have an account?{" "}  
                                <button
                                type="button"
                                onClick={() => {  
                                    navigate('/signin'); 
                                    setEmail("") 
                                    setPassword("") 
                                    setName("")  
                                }}  
                                className="font-medium text-gray-900 hover:underline">  
                                sign in  
                                </button>  
                            </p>
                        )  
                    }  
                </form>  
            </div>  
        </div>  
    )  
}