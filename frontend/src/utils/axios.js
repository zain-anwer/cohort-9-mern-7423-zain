/* creating a global axios instance here */

import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    headers: {
        "Content-Type" : "application/json"
    }
})

/* interceptors change the config object created on API call and sit between the frontend and backend */

/* request interceptor to populate authorization header */
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token)
        config.headers = {'authorization' : `Bearer ${token}`}
    return config
})

/* response interceptor to redirect to signin page at 401 */
/* first function on success and second function on error */
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401)
        {
            localStorage.removeItem('access_token')
            window.location.href = '/signin'   
        }
        return Promise.reject(error)
    }
)

export default axiosInstance