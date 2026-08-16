import axios from "axios"
import axiosInstance from "../utils/axios"

export const signup = async (user) => {
    const res = await axiosInstance.post('/auth/signup',user)
    localStorage.setItem("AccessToken",res.data.access_token)
    return res.data
}
export const signin = async (user) => {
    const res = await axiosInstance.post('/auth/signin',user)
    localStorage.setItem("AccessToken",res.data.access_token)
    return res.data
}
export const logout = async () => {
    const res = await axiosInstance.post('/auth/logout')
    localStorage.removeItem('AccessToken')
    return res.data
}