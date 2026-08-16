import { create } from 'zustand'
import { logout, signup, signin } from '../services/authService'

/* creating auth store with state and certain hooks to change state */
/* assuming backend signup and signin controllers return user object*/

const useAuthStore = create((set) => ({
    
    /* variables with their default values */
    token: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,
    user: null,

    signup: async (user) => {
        
        set({isLoading: true, error: null, user: null})
        try {
            const res = await signup(user)
            localStorage.setItem('access_token',res.data.access_token)
            set({isAuthenticated: true, token: res.data.access_token, isLoading: false, user: res.data.user})
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Signup Failed', isLoading: false})
            throw err
        }
    },

    signin: async (user) => {
        
        set({isLoading: true, error: null, user: null})
        try {
            const res = await signin(user)
            localStorage.setItem('access_token',res.data.access_token)
            set({isAuthenticated: true,token: res.data.access_token, isLoading: false, user: res.data.user})
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Signin Failed', isLoading: false})
            throw err
        }
    },

    logout: async() => {
        
        set({error: null, isLoading: true})
        try {
            await logout()
            localStorage.removeItem('access_token')
            set({isAuthenticated: false, isLoading: false, user: null, token: null})
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Logout Failed',isLoading:false})
            throw err
        }
    }
}))

export default useAuthStore