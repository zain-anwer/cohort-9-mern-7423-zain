import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProtectedRoute } from '../../src/components/ProtectedRoute.jsx'
import useAuthStore from '../../src/stores/authStore'

jest.mock('../../src/stores/authStore')

jest.mock('../../src/utils/axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}))

jest.mock('../../src/utils/socket', () => ({
    connectSocket: jest.fn(),
    disconnectSocket: jest.fn()
}))

jest.mock('react-router-dom', () => ({
    Navigate: ({ to, replace }) => (
        <div data-testid="navigate" data-to={to} data-replace={String(replace)} />
    ),
    Outlet: () => <div data-testid="outlet" />
}))

beforeEach(() => {
    jest.clearAllMocks()
})

describe('ProtectedRoute', () => {
    test('renders Outlet when the user is authenticated', () => {
        useAuthStore.mockImplementation((selector) => selector({ isAuthenticated: true }))
        render(<ProtectedRoute />)
        expect(screen.getByTestId('outlet')).toBeInTheDocument()
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    test('renders Navigate to signin when the user is not authenticated', () => {
        useAuthStore.mockImplementation((selector) => selector({ isAuthenticated: false }))
        render(<ProtectedRoute />)
        const navigate = screen.getByTestId('navigate')
        expect(navigate).toBeInTheDocument()
        expect(navigate).toHaveAttribute('data-to', '/signin')
        expect(screen.queryByTestId('outlet')).not.toBeInTheDocument()
    })

    test('passes replace as true to Navigate', () => {
        useAuthStore.mockImplementation((selector) => selector({ isAuthenticated: false }))
        render(<ProtectedRoute />)
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-replace', 'true')
    })
})