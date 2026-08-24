import { signup, signin, logout } from '../../src/services/authService.js'
import axiosInstance from '../../src/utils/axios'

jest.mock('../../src/utils/axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn()
    }
}))

beforeEach(() => {
    jest.clearAllMocks()
})

describe('signup', () => {
    test('posts to /auth/signup with the user payload', async () => {
        const user = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' }
        axiosInstance.post.mockResolvedValueOnce({ data: { id: '1' } })

        const res = await signup(user)

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/signup', user)
        expect(res).toEqual({ data: { id: '1' } })
    })

    test('propagates an error when signup fails', async () => {
        const user = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' }
        axiosInstance.post.mockRejectedValueOnce(new Error('signup failed'))

        await expect(signup(user)).rejects.toThrow('signup failed')
    })
})

describe('signin', () => {
    test('posts to /auth/signin with the user payload', async () => {
        const user = { email: 'jane@example.com', password: 'password123' }
        axiosInstance.post.mockResolvedValueOnce({ data: { id: '1' } })

        const res = await signin(user)

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/signin', user)
        expect(res).toEqual({ data: { id: '1' } })
    })

    test('propagates an error when signin fails', async () => {
        const user = { email: 'jane@example.com', password: 'wrongpass' }
        axiosInstance.post.mockRejectedValueOnce(new Error('signin failed'))

        await expect(signin(user)).rejects.toThrow('signin failed')
    })
})

describe('logout', () => {
    test('posts to /auth/logout with no payload', async () => {
        axiosInstance.post.mockResolvedValueOnce({ data: { message: 'logged out' } })

        const res = await logout()

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout')
        expect(res).toEqual({ data: { message: 'logged out' } })
    })

    test('propagates an error when logout fails', async () => {
        axiosInstance.post.mockRejectedValueOnce(new Error('logout failed'))

        await expect(logout()).rejects.toThrow('logout failed')
    })
})