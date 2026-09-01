import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Profile } from '../../src/components/Profile.jsx'
import useAuthStore from '../../src/stores/authStore'
import useProfileStore from '../../src/stores/profileStore'
import toast from 'react-hot-toast'

jest.mock('../../src/stores/authStore')
jest.mock('../../src/stores/profileStore')

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

jest.mock('lucide-react', () => ({
    CircleX: () => <svg data-testid="icon-close" />,
    Pencil: () => <svg data-testid="icon-pencil" />,
    LockKeyhole: () => <svg data-testid="icon-lock" />,
    Camera: () => <svg data-testid="icon-camera" />,
    Trash2: () => <svg data-testid="icon-trash" />,
    UserRound: () => <svg data-testid="icon-user" />,
    Mail: () => <svg data-testid="icon-mail" />
}))

const mockUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    profile_picture: null
}

let mockLogout
let mockFetchUser
let mockInitSocketListeners
let mockCleanSocketListeners
let mockChangeName
let mockChangePassword
let mockUpdateProfilePicture
let mockDeleteProfilePicture

beforeEach(() => {
    jest.clearAllMocks()

    mockLogout = jest.fn().mockResolvedValue({})
    mockFetchUser = jest.fn().mockResolvedValue({})
    mockInitSocketListeners = jest.fn()
    mockCleanSocketListeners = jest.fn()
    mockChangeName = jest.fn().mockResolvedValue({})
    mockChangePassword = jest.fn().mockResolvedValue({})
    mockUpdateProfilePicture = jest.fn().mockResolvedValue({})
    mockDeleteProfilePicture = jest.fn().mockResolvedValue({})

    useAuthStore.mockImplementation((selector) =>
        selector({
            logout: mockLogout
        })
    )

    useProfileStore.mockImplementation((selector) =>
        selector({
            user: mockUser,
            fetchUser: mockFetchUser,
            initSocketListeners: mockInitSocketListeners,
            cleanSocketListeners: mockCleanSocketListeners,
            changeName: mockChangeName,
            changePassword: mockChangePassword,
            updateProfilePicture: mockUpdateProfilePicture,
            deleteProfilePicture: mockDeleteProfilePicture
        })
    )
})

describe('Profile rendering', () => {
    test('renders the name', async () => {
        render(<Profile onClose={jest.fn()} />)

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    test('renders the email', () => {
        render(<Profile onClose={jest.fn()} />)

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    test('renders the profile image', () => {
        render(<Profile onClose={jest.fn()} />)

        const image = screen.getByAltText('Profile')

        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', '/profile-placeholder.png')
    })

    test('renders the logout button', () => {
        render(<Profile onClose={jest.fn()} />)

        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    })

    test('renders the change password button', () => {
        render(<Profile onClose={jest.fn()} />)

        expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument()
    })

    test('fetches the user when mounted', async () => {
        render(<Profile onClose={jest.fn()} />)

        await waitFor(() => {
            expect(mockFetchUser).toHaveBeenCalledTimes(1)
        })
    })

    test('initializes profile socket listeners after fetching the user', async () => {
        render(<Profile onClose={jest.fn()} />)

        await waitFor(() => {
            expect(mockFetchUser).toHaveBeenCalledTimes(1)
            expect(mockInitSocketListeners).toHaveBeenCalledTimes(1)
        })
    })
})

describe('Profile interactions', () => {
    test('calls onClose when close button is clicked', () => {
        const onClose = jest.fn()

        render(<Profile onClose={onClose} />)

        fireEvent.click(screen.getByLabelText('Close'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('calls logout when logout button is clicked', async () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
        })
    })

    test('shows success toast when logout succeeds', async () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Logged Out Successfully!')
        })
    })

    test('shows error toast with server message when logout fails', async () => {
        mockLogout.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'session expired'
                }
            }
        })

        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('session expired')
        })
    })

    test('shows generic error toast when logout fails without a message', async () => {
        mockLogout.mockRejectedValueOnce(new Error('network down'))

        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong')
        })
    })

    test('does not show success toast when logout fails', async () => {
        mockLogout.mockRejectedValueOnce(new Error('network down'))

        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled()
        })

        expect(toast.success).not.toHaveBeenCalled()
    })

    test('opens name editing mode', () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByLabelText('Change name'))

        expect(screen.getByText('Change Name')).toBeInTheDocument()
        expect(screen.getByText('New Name')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
    })

    test('cancels name editing mode', () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByLabelText('Change name'))
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.queryByText('Change Name')).not.toBeInTheDocument()
    })

    test('changes the name', async () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByLabelText('Change name'))

        const input = document.querySelector('input[type="text"]')

        fireEvent.change(input, {
            target: {
                value: 'John Doe'
            }
        })

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mockChangeName).toHaveBeenCalledWith('John Doe')
        })

        expect(toast.success).toHaveBeenCalledWith('Name Changed Successfully!')
    })

    test('opens password editing mode', () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: /Change Password/i }))

        expect(screen.getByText('Change Password')).toBeInTheDocument()
        expect(screen.getByText('Current Password')).toBeInTheDocument()
        expect(screen.getByText('New Password')).toBeInTheDocument()
    })

    test('cancels password editing mode', () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: /Change Password/i }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.queryByText('Current Password')).not.toBeInTheDocument()
    })

    test('changes the password and logs out', async () => {
        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: /Change Password/i }))

        const [oldPasswordInput, newPasswordInput] = document.querySelectorAll('input[type="password"]')

        fireEvent.change(oldPasswordInput, {
            target: {
                value: 'oldpassword'
            }
        })

        fireEvent.change(newPasswordInput, {
            target: {
                value: 'newpassword123'
            }
        })

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mockChangePassword).toHaveBeenCalledWith(
                'oldpassword',
                'newpassword123'
            )
        })

        expect(mockLogout).toHaveBeenCalledTimes(1)
        expect(toast.success).toHaveBeenCalledWith('Password Changed Successfully!')
    })

    test('updates the profile picture', async () => {
        render(<Profile onClose={jest.fn()} />)

        const file = new File(['image'], 'profile.png', {
            type: 'image/png'
        })

        const input = document.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: [file]
            }
        })

        await waitFor(() => {
            expect(mockUpdateProfilePicture).toHaveBeenCalledWith(file)
        })

        expect(toast.success).toHaveBeenCalledWith(
            'Profile Picture Updated Successfully!'
        )
    })

    test('does not update the profile picture when no file is selected', async () => {
        render(<Profile onClose={jest.fn()} />)

        const input = document.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: []
            }
        })

        expect(mockUpdateProfilePicture).not.toHaveBeenCalled()
    })

    test('removes the profile picture when one exists', async () => {
        useProfileStore.mockImplementation((selector) =>
            selector({
                user: {
                    ...mockUser,
                    profile_picture: 'https://example.com/profile.png'
                },
                fetchUser: mockFetchUser,
                initSocketListeners: mockInitSocketListeners,
                cleanSocketListeners: mockCleanSocketListeners,
                changeName: mockChangeName,
                changePassword: mockChangePassword,
                updateProfilePicture: mockUpdateProfilePicture,
                deleteProfilePicture: mockDeleteProfilePicture
            })
        )

        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByLabelText('Remove profile picture'))

        await waitFor(() => {
            expect(mockDeleteProfilePicture).toHaveBeenCalledTimes(1)
        })

        expect(toast.success).toHaveBeenCalledWith(
            'Profile Picture Removed Successfully!'
        )
    })

    test('does not render the remove profile picture button without a profile picture', () => {
        render(<Profile onClose={jest.fn()} />)

        expect(
            screen.queryByLabelText('Remove profile picture')
        ).not.toBeInTheDocument()
    })
})

describe('Profile error handling', () => {
    test('shows error toast when fetching the user fails', async () => {
        mockFetchUser.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Unable to fetch profile'
                }
            }
        })

        render(<Profile onClose={jest.fn()} />)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Unable to fetch profile')
        })
    })

    test('shows error toast when name change fails', async () => {
        mockChangeName.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Invalid name'
                }
            }
        })

        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByLabelText('Change name'))
        fireEvent.change(document.querySelector('input[type="text"]'), {
            target: {
                value: 'Invalid name'
            }
        })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid name')
        })
    })

    test('shows error toast when password change fails', async () => {
        mockChangePassword.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Incorrect Password'
                }
            }
        })

        render(<Profile onClose={jest.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: /Change Password/i }))

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Incorrect Password')
        })

        expect(mockLogout).not.toHaveBeenCalled()
    })

    test('shows error toast when profile picture update fails', async () => {
        mockUpdateProfilePicture.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Upload failed'
                }
            }
        })

        render(<Profile onClose={jest.fn()} />)

        const file = new File(['image'], 'profile.png', {
            type: 'image/png'
        })

        const input = document.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: [file]
            }
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Upload failed')
        })
    })
})