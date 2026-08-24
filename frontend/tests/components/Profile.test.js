import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Profile } from '../../src/components/Profile.jsx'
import useAuthStore from '../../src/stores/authStore'
import toast from 'react-hot-toast'

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

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

jest.mock('lucide-react', () => ({
    CircleX: () => <svg data-testid="icon-close" />
}))

const buildProps = (overrides = {}) => ({
    name: 'Jane Doe',
    email: 'jane@example.com',
    onClose: jest.fn(),
    ...overrides
})

let mockLogout

beforeEach(() => {
    jest.clearAllMocks()
    mockLogout = jest.fn().mockResolvedValue({})
    useAuthStore.mockImplementation((selector) => selector({ logout: mockLogout }))
})

describe('Profile rendering', () => {
    test('renders the name', () => {
        render(<Profile {...buildProps()} />)
        expect(screen.getByText('Name: Jane Doe')).toBeInTheDocument()
    })

    test('renders the email', () => {
        render(<Profile {...buildProps()} />)
        expect(screen.getByText('Email: jane@example.com')).toBeInTheDocument()
    })

    test('renders the profile image', () => {
        render(<Profile {...buildProps()} />)
        const image = screen.getByAltText('Profile')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', '/profile-placeholder.png')
    })

    test('renders the logout button', () => {
        render(<Profile {...buildProps()} />)
        expect(screen.getByText('logout')).toBeInTheDocument()
    })
})

describe('Profile interactions', () => {
    test('calls onClose when close button is clicked', () => {
        const props = buildProps()
        render(<Profile {...props} />)
        fireEvent.click(screen.getByLabelText('Close'))
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    test('calls logout when logout button is clicked', async () => {
        render(<Profile {...buildProps()} />)
        fireEvent.click(screen.getByText('logout'))
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
        })
    })

    test('shows success toast when logout succeeds', async () => {
        render(<Profile {...buildProps()} />)
        fireEvent.click(screen.getByText('logout'))
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Logged Out Successfully!')
        })
    })

    test('shows error toast with server message when logout fails', async () => {
        mockLogout.mockRejectedValueOnce({ response: { data: { message: 'session expired' } } })
        render(<Profile {...buildProps()} />)
        fireEvent.click(screen.getByText('logout'))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('session expired')
        })
    })

    test('shows generic error toast when logout fails without a message', async () => {
        mockLogout.mockRejectedValueOnce(new Error('network down'))
        render(<Profile {...buildProps()} />)
        fireEvent.click(screen.getByText('logout'))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })

    test('does not show success toast when logout fails', async () => {
        mockLogout.mockRejectedValueOnce(new Error('network down'))
        render(<Profile {...buildProps()} />)
        fireEvent.click(screen.getByText('logout'))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled()
        })
        expect(toast.success).not.toHaveBeenCalled()
    })
})