import { create } from 'zustand'
import { logout, signup, signin } from '../services/authService'
import { connectSocket , disconnectSocket } from '../utils/socket'
import useProfileStore from './profileStore'

const token = localStorage.getItem('access_token')
if (token)
    connectSocket(token)

const useAuthStore = create((set) => ({
    
    /* variables with their default values */
    token: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,

    signup: async (user) => {
        
        set({isLoading: true, error: null})
        try {
            const res = await signup(user)
            localStorage.setItem('access_token',res.data.access_token)
            connectSocket(res.data.access_token)
            set({isAuthenticated: true, token: res.data.access_token, isLoading: false})
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Signup Failed', isLoading: false})
            throw err
        }
    },

    signin: async (user) => {
        
        set({isLoading: true, error: null})
        try {
            const res = await signin(user)
            localStorage.setItem('access_token',res.data.access_token)
            connectSocket(res.data.access_token)
            set({isAuthenticated: true,token: res.data.access_token, isLoading: false})
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
            disconnectSocket()
            useProfileStore.getState().clearUser()
            set({isAuthenticated: false, isLoading: false, token: null})
        }
    }
}))

export default useAuthStore