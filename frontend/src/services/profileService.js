import axiosInstance from "../utils/axios.js"

export const profileFetchService = async () => {
   const res = await axiosInstance.get('/profile/')
   return res
}

export const profileNameChangeService = async (new_name) => {
    const res = await axiosInstance.put('/profile/name/',{new_name:new_name})
    return res
}

export const profilePasswordChangeService = async (old_password,new_password) => {
    const res = await axiosInstance.put('/profile/password/',{old_password: old_password,new_password: new_password})
    return res
}

export const profilePictureUpdateService = async (image) => {
    const formData = new FormData()
    formData.append('file',image)
    const res = await axiosInstance.put('/profile/picture/',formData)
    return res
}

export const profilePictureDeleteService = async () => {
    const res = await axiosInstance.delete('/profile/picture/')
    return res
}

