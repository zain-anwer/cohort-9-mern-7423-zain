import { create } from 'zustand'
import { logout, signup, signin } from '../services/authService'
import { connectSocket , disconnectSocket } from '../utils/socket'

/* creating auth store with state and certain hooks to change state */
/* assuming backend signup and signin controllers return user object*/

const getStoredUser = () => {
    try {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    }
    catch {
        return null   // handles corrupted/malformed JSON gracefully
    }
}

/* module level call to keep socket connectivity after page refresh */
/* apparently everything will go to shit after a refresh and signin signup won't happen so socket is screwed otherwise */

const token = localStorage.getItem('access_token')
if (token)
    connectSocket(token)

const useAuthStore = create((set) => ({
    
    /* variables with their default values */
    token: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,
    user: getStoredUser(),

    signup: async (user) => {
        
        set({isLoading: true, error: null, user: null})
        try {
            const res = await signup(user)
            localStorage.setItem('access_token',res.data.access_token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            connectSocket(res.data.access_token)
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
            localStorage.setItem('user', JSON.stringify(res.data.user))
            connectSocket(res.data.access_token)
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
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Logout Failed',isLoading:false})
            throw err
        }

        /* clear local storage and change state even if api call fails at backend */

        finally {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            disconnectSocket()
            set({isAuthenticated: false, isLoading: false, user: null, token: null})
        }
    }
}))

export default useAuthStore