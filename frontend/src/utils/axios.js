/* creating a global axios instance here */

import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    headers: {
        "Content-Type" : "application/json"
    }
})

/* interceptors change the config object created on API call and sit between the frontend and backend */
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('AccessToken')
    if (token)
        config.headers = {'authorization' : `Bearer ${token}`}
    return config
})

export default axiosInstance