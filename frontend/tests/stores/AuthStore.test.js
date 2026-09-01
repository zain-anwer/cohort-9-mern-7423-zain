import { connectSocket, disconnectSocket } from '../../src/utils/socket'
import { signup as signupService, signin as signinService, logout as logoutService } from '../../src/services/authService'

jest.mock('../../src/services/authService', () => ({
    signup: jest.fn(),
    signin: jest.fn(),
    logout: jest.fn()
}))

jest.mock('../../src/utils/socket', () => ({
    connectSocket: jest.fn(),
    disconnectSocket: jest.fn()
}))

const mockClearUser = jest.fn()

jest.mock('../../src/stores/profileStore', () => ({
    __esModule: true,
    default: {
        getState: () => ({ clearUser: mockClearUser })
    }
}))

const loadStore = () => {
    let useAuthStore
    jest.isolateModules(() => {
        useAuthStore = require('../../src/stores/authStore').default
    })
    return useAuthStore
}

beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
})

describe('initial state', () => {
    test('reads token and isAuthenticated from localStorage on load', () => {
        localStorage.setItem('access_token', 'abc123')

        const useAuthStore = loadStore()
        const state = useAuthStore.getState()

        expect(state.token).toBe('abc123')
        expect(state.isAuthenticated).toBe(true)
    })

    test('defaults to an unauthenticated state when localStorage is empty', () => {
        const useAuthStore = loadStore()
        const state = useAuthStore.getState()

        expect(state.token).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
    })

    test('connects the socket on load when a token already exists', () => {
        localStorage.setItem('access_token', 'abc123')

        loadStore()

        expect(connectSocket).toHaveBeenCalledWith('abc123')
    })

    test('does not connect the socket on load when no token exists', () => {
        loadStore()

        expect(connectSocket).not.toHaveBeenCalled()
    })
})

describe('signup', () => {
    test('stores the token, connects the socket and marks the user authenticated', async () => {
        const useAuthStore = loadStore()
        signupService.mockResolvedValueOnce({ data: { access_token: 'abc123', user: { name: 'Jane Doe' } } })

        await useAuthStore.getState().signup({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })

        expect(signupService).toHaveBeenCalledWith({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })
        expect(localStorage.getItem('access_token')).toBe('abc123')
        expect(connectSocket).toHaveBeenCalledWith('abc123')

        const state = useAuthStore.getState()
        expect(state.isAuthenticated).toBe(true)
        expect(state.token).toBe('abc123')
        expect(state.isLoading).toBe(false)
    })

    test('sets isLoading to true while the request is in flight', async () => {
        const useAuthStore = loadStore()
        let resolveSignup
        signupService.mockReturnValueOnce(new Promise((resolve) => { resolveSignup = resolve }))

        const promise = useAuthStore.getState().signup({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })

        expect(useAuthStore.getState().isLoading).toBe(true)

        resolveSignup({ data: { access_token: 'abc123', user: { name: 'Jane Doe' } } })
        await promise
    })

    test('sets an error and stops loading when signup fails with a server message', async () => {
        const useAuthStore = loadStore()
        signupService.mockRejectedValueOnce({ response: { data: { message: 'Email already in use' } } })

        await expect(useAuthStore.getState().signup({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })).rejects.toBeTruthy()

        const state = useAuthStore.getState()
        expect(state.error).toBe('Email already in use')
        expect(state.isLoading).toBe(false)
        expect(state.isAuthenticated).toBe(false)
        expect(connectSocket).not.toHaveBeenCalled()
    })

    test('falls back to a generic error message when signup fails without a server message', async () => {
        const useAuthStore = loadStore()
        signupService.mockRejectedValueOnce(new Error('network down'))

        await expect(useAuthStore.getState().signup({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })).rejects.toThrow('network down')

        expect(useAuthStore.getState().error).toBe('Signup Failed')
    })
})

describe('signin', () => {
    test('stores the token, connects the socket and marks the user authenticated', async () => {
        const useAuthStore = loadStore()
        signinService.mockResolvedValueOnce({ data: { access_token: 'abc123', user: { name: 'Jane Doe' } } })

        await useAuthStore.getState().signin({ email: 'jane@example.com', password: 'password123' })

        expect(signinService).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' })
        expect(localStorage.getItem('access_token')).toBe('abc123')
        expect(connectSocket).toHaveBeenCalledWith('abc123')

        const state = useAuthStore.getState()
        expect(state.isAuthenticated).toBe(true)
        expect(state.token).toBe('abc123')
        expect(state.isLoading).toBe(false)
    })

    test('sets an error and stops loading when signin fails with a server message', async () => {
        const useAuthStore = loadStore()
        signinService.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } })

        await expect(useAuthStore.getState().signin({ email: 'jane@example.com', password: 'wrongpass' })).rejects.toBeTruthy()

        const state = useAuthStore.getState()
        expect(state.error).toBe('Invalid credentials')
        expect(state.isLoading).toBe(false)
        expect(state.isAuthenticated).toBe(false)
        expect(connectSocket).not.toHaveBeenCalled()
    })

    test('falls back to a generic error message when signin fails without a server message', async () => {
        const useAuthStore = loadStore()
        signinService.mockRejectedValueOnce(new Error('network down'))

        await expect(useAuthStore.getState().signin({ email: 'jane@example.com', password: 'password123' })).rejects.toThrow('network down')

        expect(useAuthStore.getState().error).toBe('Signin Failed')
    })
})

describe('logout', () => {
    test('clears local storage, disconnects the socket, clears profile state and resets state on success', async () => {
        localStorage.setItem('access_token', 'abc123')
        const useAuthStore = loadStore()
        logoutService.mockResolvedValueOnce({})

        await useAuthStore.getState().logout()

        expect(logoutService).toHaveBeenCalledTimes(1)
        expect(localStorage.getItem('access_token')).toBeNull()
        expect(disconnectSocket).toHaveBeenCalledTimes(1)
        expect(mockClearUser).toHaveBeenCalledTimes(1)

        const state = useAuthStore.getState()
        expect(state.isAuthenticated).toBe(false)
        expect(state.token).toBeNull()
        expect(state.isLoading).toBe(false)
    })

    test('still clears local storage, disconnects the socket, clears profile state and resets state when the api call fails', async () => {
        localStorage.setItem('access_token', 'abc123')
        const useAuthStore = loadStore()
        logoutService.mockRejectedValueOnce({ response: { data: { message: 'Logout endpoint down' } } })

        await expect(useAuthStore.getState().logout()).rejects.toBeTruthy()

        expect(localStorage.getItem('access_token')).toBeNull()
        expect(disconnectSocket).toHaveBeenCalledTimes(1)
        expect(mockClearUser).toHaveBeenCalledTimes(1)

        const state = useAuthStore.getState()
        expect(state.isAuthenticated).toBe(false)
        expect(state.token).toBeNull()
        expect(state.isLoading).toBe(false)
        expect(state.error).toBe('Logout endpoint down')
    })

    test('falls back to a generic error message when logout fails without a server message', async () => {
        const useAuthStore = loadStore()
        logoutService.mockRejectedValueOnce(new Error('network down'))

        await expect(useAuthStore.getState().logout()).rejects.toThrow('network down')

        expect(useAuthStore.getState().error).toBe('Logout Failed')
        expect(mockClearUser).toHaveBeenCalledTimes(1)
    })
})