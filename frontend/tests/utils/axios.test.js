jest.mock('axios', () => {
    const mockAxiosInstance = {
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    }
    return {
        __esModule: true,
        default: {
            create: jest.fn(() => mockAxiosInstance)
        }
    }
})

import axios from 'axios'
import axiosInstance from '../../src/utils/axios.js'

const mockAxiosInstance = axios.create.mock.results[0].value
const mockRequestUse = mockAxiosInstance.interceptors.request.use
const mockResponseUse = mockAxiosInstance.interceptors.response.use

const requestHandler = mockRequestUse.mock.calls[0][0]
const [responseSuccessHandler, responseErrorHandler] = mockResponseUse.mock.calls[0]

describe('axios instance creation', () => {
    test('creates the instance with a baseURL pointing at /api', () => {
        const config = axios.create.mock.calls[0][0]
        expect(config.baseURL.endsWith('/api')).toBe(true)
    })

    test('exports the created instance', () => {
        expect(axiosInstance).toBe(mockAxiosInstance)
    })
})

describe('request interceptor', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    test('adds an authorization header when a token is stored', () => {
        localStorage.setItem('access_token', 'abc123')
        const config = { headers: {} }

        const result = requestHandler(config)

        expect(result.headers).toEqual({ authorization: 'Bearer abc123' })
    })

    test('leaves the config headers unchanged when no token is stored', () => {
        const config = { headers: { 'Content-Type': 'application/json' } }

        const result = requestHandler(config)

        expect(result.headers).toEqual({ 'Content-Type': 'application/json' })
    })

    test('returns the same config object it was given', () => {
        const config = { headers: {} }

        expect(requestHandler(config)).toBe(config)
    })
})

describe('response interceptor', () => {
    let assignMock
    let originalAssign

    beforeAll(() => {
        originalAssign = window.location.assign
    })

    afterAll(() => {
        Object.defineProperty(window.location, 'assign', {
            configurable: true,
            writable: true,
            value: originalAssign
        })
    })

    beforeEach(() => {
        localStorage.clear()
        assignMock = jest.fn()
        Object.defineProperty(window.location, 'assign', {
            configurable: true,
            writable: true,
            value: assignMock
        })
    })

    test('passes the response through unchanged on success', () => {
        const response = { data: { ok: true } }
        expect(responseSuccessHandler(response)).toBe(response)
    })

    test('clears storage and redirects to signin on a 401 from a non-auth endpoint', async () => {
        localStorage.setItem('access_token', 'abc123')
        localStorage.setItem('user', JSON.stringify({ name: 'Jane Doe' }))
        const error = { response: { status: 401 }, config: { url: '/notes/' } }

        await expect(responseErrorHandler(error)).rejects.toBe(error)

        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
        expect(assignMock).toHaveBeenCalledWith('/signin')
    })

    test('does not redirect on a 401 from the signin endpoint', async () => {
        localStorage.setItem('access_token', 'abc123')
        const error = { response: { status: 401 }, config: { url: '/auth/signin' } }

        await expect(responseErrorHandler(error)).rejects.toBe(error)

        expect(assignMock).not.toHaveBeenCalled()
        expect(localStorage.getItem('access_token')).toBe('abc123')
    })

    test('does not redirect on a 401 from the signup endpoint', async () => {
        localStorage.setItem('access_token', 'abc123')
        const error = { response: { status: 401 }, config: { url: '/auth/signup' } }

        await expect(responseErrorHandler(error)).rejects.toBe(error)

        expect(assignMock).not.toHaveBeenCalled()
        expect(localStorage.getItem('access_token')).toBe('abc123')
    })

    test('does not redirect on a non-401 error', async () => {
        const error = { response: { status: 500 }, config: { url: '/notes/' } }

        await expect(responseErrorHandler(error)).rejects.toBe(error)

        expect(assignMock).not.toHaveBeenCalled()
    })

    test('does not redirect when the error has no response object', async () => {
        const error = { config: { url: '/notes/' } }

        await expect(responseErrorHandler(error)).rejects.toBe(error)

        expect(assignMock).not.toHaveBeenCalled()
    })
})