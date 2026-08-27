import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthPage } from '../../src/pages/AuthPage.jsx'
import useAuthStore from '../../src/stores/authStore'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

jest.mock('../../src/stores/authStore', () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
    useNavigate: jest.fn()
}))

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

jest.mock('lucide-react', () => ({
    LoaderCircle: () => <svg data-testid="icon-loader" />,
    NotebookPen: () => <svg data-testid="icon-notebook" />,
    Eye: () => <svg data-testid="icon-eye" />,
    EyeOff: () => <svg data-testid="icon-eye-off" />,
    Mail: () => <svg data-testid="icon-mail" />,
    User: () => <svg data-testid="icon-user" />
}))

let mockSignin
let mockSignup
let mockNavigate

const setStoreState = (overrides = {}) => {
    useAuthStore.mockImplementation((selector) => selector({
        signin: mockSignin,
        signup: mockSignup,
        isLoading: false,
        ...overrides
    }))
}

beforeEach(() => {
    jest.clearAllMocks()
    mockSignin = jest.fn().mockResolvedValue({})
    mockSignup = jest.fn().mockResolvedValue({})
    mockNavigate = jest.fn()
    useNavigate.mockReturnValue(mockNavigate)
    useLocation.mockReturnValue({ pathname: '/signup' })
    setStoreState()
})

describe('AuthPage rendering', () => {
    test('renders the name field on the signup page', () => {
        render(<AuthPage />)
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    test('does not render the name field on the signin page', () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        render(<AuthPage />)
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    })

    test('renders email and password fields', () => {
        render(<AuthPage />)
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    test('shows signup as the submit button text on the signup page', () => {
        const { container } = render(<AuthPage />)
        expect(container.querySelector('button[type="submit"]')).toHaveTextContent('signup')
    })

    test('shows signin as the submit button text on the signin page', () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        const { container } = render(<AuthPage />)
        expect(container.querySelector('button[type="submit"]')).toHaveTextContent('signin')
    })

    test('shows a loader and disables the submit button while loading', () => {
        setStoreState({ isLoading: true })
        const { container } = render(<AuthPage />)
        expect(screen.getByTestId('icon-loader')).toBeInTheDocument()
        expect(container.querySelector('button[type="submit"]')).toBeDisabled()
    })

    test('shows the signup prompt link on the signin page', () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        render(<AuthPage />)
        expect(screen.getByText('sign up')).toBeInTheDocument()
    })

    test('shows the signin prompt link on the signup page', () => {
        render(<AuthPage />)
        expect(screen.getByText('sign in')).toBeInTheDocument()
    })
})

describe('AuthPage interactions', () => {
    test('toggles password visibility', () => {
        render(<AuthPage />)
        const passwordInput = screen.getByLabelText('Password')
        expect(passwordInput).toHaveAttribute('type', 'password')
        fireEvent.click(screen.getByLabelText('Show password'))
        expect(passwordInput).toHaveAttribute('type', 'text')
        fireEvent.click(screen.getByLabelText('Hide password'))
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('shows a validation toast when email is missing', () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))
        expect(toast.error).toHaveBeenCalledWith('All Fields Required')
        expect(mockSignin).not.toHaveBeenCalled()
    })

    test('shows a validation toast when password is missing', () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))
        expect(toast.error).toHaveBeenCalledWith('All Fields Required')
        expect(mockSignin).not.toHaveBeenCalled()
    })

    test('shows a validation toast when name is missing on signup', () => {
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))
        expect(toast.error).toHaveBeenCalledWith('All Fields Required')
        expect(mockSignup).not.toHaveBeenCalled()
    })

    test('calls signup with trimmed values and navigates on success', async () => {
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Jane Doe  ' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: '  jane@example.com  ' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })
        })
        expect(toast.success).toHaveBeenCalledWith('signup successful')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    test('calls signin with trimmed values and navigates on success', async () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: '  jane@example.com  ' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))

        await waitFor(() => {
            expect(mockSignin).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' })
        })
        expect(toast.success).toHaveBeenCalledWith('signin successful')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    test('shows the server error message when signin fails', async () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        mockSignin.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } })
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
        })
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    test('shows a generic error message when signup fails without a server message', async () => {
        mockSignup.mockRejectedValueOnce(new Error('network down'))
        const { container } = render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(container.querySelector('button[type="submit"]'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })

    test('navigates to signup and clears fields when the signup link is clicked', () => {
        useLocation.mockReturnValue({ pathname: '/signin' })
        render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByText('sign up'))

        expect(mockNavigate).toHaveBeenCalledWith('/signup')
        expect(screen.getByLabelText('Email')).toHaveValue('')
        expect(screen.getByLabelText('Password')).toHaveValue('')
    })

    test('navigates to signin and clears fields when the signin link is clicked', () => {
        render(<AuthPage />)
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
        fireEvent.click(screen.getByText('sign in'))

        expect(mockNavigate).toHaveBeenCalledWith('/signin')
        expect(screen.getByLabelText('Name')).toHaveValue('')
        expect(screen.getByLabelText('Email')).toHaveValue('')
    })
})