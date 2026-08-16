import axiosInstance from "../utils/axios"

export const signup = async (user) => {
    const res = await axiosInstance.post('/auth/signup',user)
    return res.data
}
export const signin = async (user) => {
    const res = await axiosInstance.post('/auth/signin',user)
    return res.data
}
export const logout = async () => {
    const res = await axiosInstance.post('/auth/logout')
    return res.data
}