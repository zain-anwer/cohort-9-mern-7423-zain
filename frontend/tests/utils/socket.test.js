import { io } from 'socket.io-client'
import { connectSocket, disconnectSocket, getSocket } from '../../src/utils/socket.js'

jest.mock('socket.io-client', () => ({
    io: jest.fn()
}))

io.mockImplementation((url, options) => ({
    auth: options.auth,
    disconnect: jest.fn()
}))

beforeEach(() => {
    disconnectSocket()
    io.mockClear()
})

describe('connectSocket', () => {
    test('creates a new socket with the given token when none exists', () => {
        const result = connectSocket('abc123')

        expect(io).toHaveBeenCalledTimes(1)
        expect(io).toHaveBeenCalledWith(expect.any(String), { auth: { token: 'abc123' } })
        expect(result.auth).toEqual({ token: 'abc123' })
        expect(getSocket()).toBe(result)
    })

    test('reuses the existing socket when called again with the same token', () => {
        const first = connectSocket('abc123')
        const second = connectSocket('abc123')

        expect(io).toHaveBeenCalledTimes(1)
        expect(second).toBe(first)
        expect(getSocket()).toBe(first)
    })

    test('disconnects the old socket and creates a new one when the token changes', () => {
        const first = connectSocket('abc123')
        const second = connectSocket('xyz789')

        expect(first.disconnect).toHaveBeenCalledTimes(1)
        expect(io).toHaveBeenCalledTimes(2)
        expect(second).not.toBe(first)
        expect(second.auth).toEqual({ token: 'xyz789' })
        expect(getSocket()).toBe(second)
    })
})

describe('disconnectSocket', () => {
    test('disconnects the active socket and clears it', () => {
        const socket = connectSocket('abc123')

        disconnectSocket()

        expect(socket.disconnect).toHaveBeenCalledTimes(1)
        expect(getSocket()).toBeNull()
    })

    test('does nothing when there is no active socket', () => {
        expect(() => disconnectSocket()).not.toThrow()
        expect(getSocket()).toBeNull()
    })
})

describe('getSocket', () => {
    test('returns null before any socket has been created', () => {
        expect(getSocket()).toBeNull()
    })

    test('returns the currently connected socket', () => {
        const socket = connectSocket('abc123')
        expect(getSocket()).toBe(socket)
    })
})