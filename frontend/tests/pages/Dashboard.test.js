import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dashboard } from '../../src/pages/Dashboard.jsx'
import useProfileStore from '../../src/stores/profileStore'
import useNoteStore from '../../src/stores/noteStore'
import toast from 'react-hot-toast'

const originalCreateElement = document.createElement.bind(document)

jest.mock('../../src/stores/authStore', () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock('../../src/stores/profileStore', () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock('../../src/stores/noteStore', () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

jest.mock('../../src/components/NoteEditor.jsx', () => ({
    NoteEditor: ({
        note,
        onSave,
        onDelete,
        onArchive,
        onRestore,
        onExport,
        onClose,
        isReadOnly
    }) => (
        <div data-testid="note-editor">
            <span>{note?.title}</span>
            <span>{isReadOnly ? 'readonly' : 'editable'}</span>
            <button onClick={onClose}>close-editor</button>
            <button onClick={() => onSave(note._id, note)}>save-editor</button>
            <button onClick={() => onDelete(note)}>delete-editor</button>
            {onArchive && <button onClick={onArchive}>archive-editor</button>}
            {onRestore && <button onClick={onRestore}>restore-editor</button>}
            <button onClick={onExport}>export-editor</button>
        </div>
    )
}))

jest.mock('../../src/components/NoteCard.jsx', () => ({
    NoteCard: ({
        title,
        onClick,
        onPin,
        onArchive,
        onRestore,
        onDelete,
        isPinned,
        isPermanentDelete
    }) => (
        <div data-testid={`notecard-${title}`}>
            <button onClick={onClick}>{title}</button>
            {onPin && (
                <button
                    aria-label={`${isPinned ? 'unpin' : 'pin'}-${title}`}
                    onClick={onPin}
                >
                    {isPinned ? 'unpin' : 'pin'}
                </button>
            )}
            {onArchive && (
                <button
                    aria-label={`archive-${title}`}
                    onClick={onArchive}
                >
                    archive
                </button>
            )}
            {onRestore && (
                <button
                    aria-label={`restore-${title}`}
                    onClick={onRestore}
                >
                    restore
                </button>
            )}
            {onDelete && (
                <button
                    aria-label={
                        isPermanentDelete
                            ? `delete-permanent-${title}`
                            : `delete-${title}`
                    }
                    onClick={onDelete}
                >
                    delete
                </button>
            )}
        </div>
    )
}))

jest.mock('../../src/components/Profile.jsx', () => ({
    Profile: ({ onClose }) => (
        <div data-testid="profile-modal">
            <button onClick={onClose}>close-profile</button>
        </div>
    )
}))

jest.mock('lucide-react', () => ({
    CircleUserRound: () => <svg data-testid="icon-user-round" />,
    StickyNotePlus: () => <svg data-testid="icon-note-plus" />,
    StickyNote: () => <svg data-testid="icon-sticky-note" />,
    Search: () => <svg data-testid="icon-search" />,
    Files: () => <svg data-testid="icon-files" />,
    Pin: () => <svg data-testid="icon-pin" />,
    Archive: () => <svg data-testid="icon-archive" />,
    Trash2: () => <svg data-testid="icon-trash" />,
    Upload: () => <svg data-testid="icon-upload" />
}))

const buildNote = (overrides = {}) => ({
    _id: '1',
    title: 'Untitled',
    content: '',
    is_pinned: false,
    is_archived: false,
    is_binned: false,
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
})

let mockGetAllNotes
let mockCreateNote
let mockUpdateNote
let mockDeleteNote
let mockExportNote
let mockImportNote
let mockInitSocketListeners
let mockCleanSocketListeners

let mockFetchUser
let mockInitProfileSocketListeners
let mockCleanProfileSocketListeners

const setNoteStoreState = (notes) => {
    useNoteStore.mockImplementation((selector) =>
        selector({
            notes,
            getAllNotes: mockGetAllNotes,
            createNote: mockCreateNote,
            updateNote: mockUpdateNote,
            deleteNote: mockDeleteNote,
            exportNote: mockExportNote,
            importNote: mockImportNote,
            initSocketListeners: mockInitSocketListeners,
            cleanSocketListeners: mockCleanSocketListeners
        })
    )
}

const setProfileStoreState = (user) => {
    useProfileStore.mockImplementation((selector) =>
        selector({
            user,
            fetchUser: mockFetchUser,
            initSocketListeners: mockInitProfileSocketListeners,
            cleanSocketListeners: mockCleanProfileSocketListeners
        })
    )
}

const defaultUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    profile_picture: null
}

const defaultNotes = [
    buildNote({
        _id: 'a',
        title: 'First Note',
        content: '<p>Alpha content</p>',
        updatedAt: '2024-01-03T00:00:00Z'
    }),
    buildNote({
        _id: 'b',
        title: 'Second Note',
        content: '<p>Beta content</p>',
        is_pinned: true,
        updatedAt: '2024-01-02T00:00:00Z',
        pinned_at: '2024-01-05T00:00:00Z'
    }),
    buildNote({
        _id: 'c',
        title: 'Archived Note',
        content: '<p>Gamma content</p>',
        is_archived: true,
        archived_at: '2024-01-01T00:00:00Z'
    }),
    buildNote({
        _id: 'd',
        title: 'Binned Note',
        content: '<p>Delta content</p>',
        is_binned: true,
        binned_at: '2024-01-01T00:00:00Z'
    })
]

beforeEach(() => {
    jest.clearAllMocks()

    mockGetAllNotes = jest.fn().mockResolvedValue([])
    mockCreateNote = jest.fn().mockResolvedValue(
        buildNote({
            _id: 'new',
            title: 'Untitled'
        })
    )
    mockUpdateNote = jest.fn().mockResolvedValue({})
    mockDeleteNote = jest.fn().mockResolvedValue({})
    mockExportNote = jest.fn().mockResolvedValue({
        headers: {},
        data: new Blob(['content'])
    })
    mockImportNote = jest.fn().mockResolvedValue({})
    mockInitSocketListeners = jest.fn()
    mockCleanSocketListeners = jest.fn()

    mockFetchUser = jest.fn().mockResolvedValue(defaultUser)
    mockInitProfileSocketListeners = jest.fn()
    mockCleanProfileSocketListeners = jest.fn()

    setProfileStoreState(defaultUser)
    setNoteStoreState(defaultNotes)
})

describe('Dashboard lifecycle', () => {
    test('renders the dashboard heading', () => {
        render(<Dashboard />)

        expect(screen.getByText('Scribble Dashboard')).toBeInTheDocument()
    })

    test('loads notes and initializes note socket listeners on mount', async () => {
        render(<Dashboard />)

        await waitFor(() => {
            expect(mockGetAllNotes).toHaveBeenCalledTimes(1)
        })

        expect(mockInitSocketListeners).toHaveBeenCalledTimes(1)
    })

    test('loads the user profile and initializes profile socket listeners on mount', async () => {
        render(<Dashboard />)

        await waitFor(() => {
            expect(mockFetchUser).toHaveBeenCalledTimes(1)
        })

        expect(mockInitProfileSocketListeners).toHaveBeenCalledTimes(1)
    })

    test('cleans up note and profile socket listeners on unmount', () => {
        const { unmount } = render(<Dashboard />)

        unmount()

        expect(mockCleanSocketListeners).toHaveBeenCalledTimes(1)
        expect(mockCleanProfileSocketListeners).toHaveBeenCalledTimes(1)
    })

    test('shows an error toast when loading notes fails', async () => {
        mockGetAllNotes.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'load failed'
                }
            }
        })

        render(<Dashboard />)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('load failed')
        })
    })

    test('shows the default error when loading notes fails without a response message', async () => {
        mockGetAllNotes.mockRejectedValueOnce(new Error('load failed'))

        render(<Dashboard />)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('failed to load notes')
        })
    })

    test('shows an error toast when loading the profile fails', async () => {
        mockFetchUser.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'profile load failed'
                }
            }
        })

        render(<Dashboard />)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('profile load failed')
        })
    })

    test('shows the default error when loading the profile fails without a response message', async () => {
        mockFetchUser.mockRejectedValueOnce(new Error('profile load failed'))

        render(<Dashboard />)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong')
        })
    })
})

describe('Dashboard filtering and views', () => {
    test('shows only active notes in the all view', () => {
        render(<Dashboard />)

        expect(screen.getByText('First Note')).toBeInTheDocument()
        expect(screen.getByText('Second Note')).toBeInTheDocument()
        expect(screen.queryByText('Archived Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Binned Note')).not.toBeInTheDocument()
    })

    test('excludes archived and binned notes from the all view', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Active Note',
                updatedAt: '2024-01-04T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Pinned Note',
                is_pinned: true,
                pinned_at: '2024-01-03T00:00:00Z'
            }),
            buildNote({
                _id: 'c',
                title: 'Archived Note',
                is_archived: true
            }),
            buildNote({
                _id: 'd',
                title: 'Binned Note',
                is_binned: true
            }),
            buildNote({
                _id: 'e',
                title: 'Archived Pinned Note',
                is_archived: true,
                is_pinned: true
            }),
            buildNote({
                _id: 'f',
                title: 'Binned Pinned Note',
                is_binned: true,
                is_pinned: true
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        expect(screen.getByText('Active Note')).toBeInTheDocument()
        expect(screen.getByText('Pinned Note')).toBeInTheDocument()
        expect(screen.queryByText('Archived Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Binned Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Archived Pinned Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Binned Pinned Note')).not.toBeInTheDocument()
    })

    test('shows only pinned notes in the pinned view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))

        expect(screen.getByText('Second Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Archived Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Binned Note')).not.toBeInTheDocument()
    })

    test('shows only archived notes in the archived view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Archived notes'))

        expect(screen.getByText('Archived Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Binned Note')).not.toBeInTheDocument()
    })

    test('shows only binned notes in the binned view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))

        expect(screen.getByText('Binned Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Archived Note')).not.toBeInTheDocument()
    })

    test('shows the all view empty state', () => {
        setNoteStoreState([])

        render(<Dashboard />)

        expect(screen.getByText('No Notes Yet')).toBeInTheDocument()
        expect(screen.getByAltText('No Notes Yet')).toBeInTheDocument()
    })

    test('shows the pinned view empty state', () => {
        setNoteStoreState(defaultNotes.filter((note) => !note.is_pinned))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))

        expect(screen.getByText('Nothing Pinned')).toBeInTheDocument()
        expect(screen.getByAltText('Nothing pinned')).toBeInTheDocument()
    })

    test('shows the archived view empty state', () => {
        setNoteStoreState(defaultNotes.filter((note) => !note.is_archived))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Archived notes'))

        expect(screen.getByText('Empty Archive')).toBeInTheDocument()
        expect(screen.getByAltText('Empty archive')).toBeInTheDocument()
    })

    test('shows the binned view empty state', () => {
        setNoteStoreState(defaultNotes.filter((note) => !note.is_binned))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))

        expect(screen.getByText('Empty Bin')).toBeInTheDocument()
        expect(screen.getByAltText('Empty bin')).toBeInTheDocument()
    })

    test('filters notes by title', () => {
        render(<Dashboard />)

        fireEvent.change(screen.getByPlaceholderText('Search notes'), {
            target: {
                value: 'first'
            }
        })

        expect(screen.getByText('First Note')).toBeInTheDocument()
        expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
    })

    test('filters notes by stripped content', () => {
        render(<Dashboard />)

        fireEvent.change(screen.getByPlaceholderText('Search notes'), {
            target: {
                value: 'beta content'
            }
        })

        expect(screen.getByText('Second Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    })

    test('searches case insensitively and trims whitespace', () => {
        render(<Dashboard />)

        fireEvent.change(screen.getByPlaceholderText('Search notes'), {
            target: {
                value: '  FIRST NOTE  '
            }
        })

        expect(screen.getByText('First Note')).toBeInTheDocument()
        expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
    })

    test('applies search within the selected view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))

        fireEvent.change(screen.getByPlaceholderText('Search notes'), {
            target: {
                value: 'second'
            }
        })

        expect(screen.getByText('Second Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    })

    test('shows create and import buttons in the all view', () => {
        render(<Dashboard />)

        expect(screen.getByLabelText('Create note')).toBeInTheDocument()
        expect(screen.getByLabelText('Import note')).toBeInTheDocument()
    })

    test('hides create and import buttons outside the all view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))

        expect(screen.queryByLabelText('Create note')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Import note')).not.toBeInTheDocument()
    })
})

describe('Dashboard ordering', () => {
    test('places pinned notes before unpinned notes in the all view', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Unpinned Newest',
                updatedAt: '2024-01-10T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Pinned Older',
                is_pinned: true,
                pinned_at: '2024-01-02T00:00:00Z'
            }),
            buildNote({
                _id: 'c',
                title: 'Pinned Newer',
                is_pinned: true,
                pinned_at: '2024-01-05T00:00:00Z'
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        const cards = screen.getAllByTestId(/^notecard-/)

        expect(cards[0]).toHaveTextContent('Pinned Newer')
        expect(cards[1]).toHaveTextContent('Pinned Older')
        expect(cards[2]).toHaveTextContent('Unpinned Newest')
    })

    test('orders unpinned notes by updatedAt descending in the all view', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Older Note',
                updatedAt: '2024-01-01T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Newest Note',
                updatedAt: '2024-01-05T00:00:00Z'
            }),
            buildNote({
                _id: 'c',
                title: 'Middle Note',
                updatedAt: '2024-01-03T00:00:00Z'
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        const cards = screen.getAllByTestId(/^notecard-/)

        expect(cards[0]).toHaveTextContent('Newest Note')
        expect(cards[1]).toHaveTextContent('Middle Note')
        expect(cards[2]).toHaveTextContent('Older Note')
    })

    test('orders pinned notes by pinned_at descending in the all view', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Pinned Old',
                is_pinned: true,
                pinned_at: '2024-01-01T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Pinned New',
                is_pinned: true,
                pinned_at: '2024-01-05T00:00:00Z'
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        const cards = screen.getAllByTestId(/^notecard-/)

        expect(cards[0]).toHaveTextContent('Pinned New')
        expect(cards[1]).toHaveTextContent('Pinned Old')
    })

    test('orders pinned notes by pinned_at ascending in the pinned view', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Pinned Old',
                is_pinned: true,
                pinned_at: '2024-01-01T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Pinned New',
                is_pinned: true,
                pinned_at: '2024-01-05T00:00:00Z'
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))

        const cards = screen.getAllByTestId(/^notecard-/)

        expect(cards[0]).toHaveTextContent('Pinned Old')
        expect(cards[1]).toHaveTextContent('Pinned New')
    })

    test('orders archived notes by archived_at ascending', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Archived New',
                is_archived: true,
                archived_at: '2024-01-05T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Archived Old',
                is_archived: true,
                archived_at: '2024-01-01T00:00:00Z'
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Archived notes'))

        const cards = screen.getAllByTestId(/^notecard-/)

        expect(cards[0]).toHaveTextContent('Archived Old')
        expect(cards[1]).toHaveTextContent('Archived New')
    })

    test('orders binned notes by binned_at ascending', () => {
        const notes = [
            buildNote({
                _id: 'a',
                title: 'Binned New',
                is_binned: true,
                binned_at: '2024-01-05T00:00:00Z'
            }),
            buildNote({
                _id: 'b',
                title: 'Binned Old',
                is_binned: true,
                binned_at: '2024-01-01T00:00:00Z'
            })
        ]

        setNoteStoreState(notes)

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))

        const cards = screen.getAllByTestId(/^notecard-/)

        expect(cards[0]).toHaveTextContent('Binned Old')
        expect(cards[1]).toHaveTextContent('Binned New')
    })
})

describe('Dashboard note creation and editor', () => {
    test('creates a new note with the default values', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Create note'))

        await waitFor(() => {
            expect(mockCreateNote).toHaveBeenCalledWith({
                title: 'Untitled',
                content: ''
            })
        })
    })

    test('opens the newly created note in editable mode', async () => {
        const createdNote = buildNote({
            _id: 'new',
            title: 'Untitled'
        })

        setNoteStoreState([...defaultNotes, createdNote])
        mockCreateNote.mockResolvedValueOnce(createdNote)

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Create note'))

        await waitFor(() => {
            expect(screen.getByTestId('note-editor')).toBeInTheDocument()
        })

        expect(
            within(screen.getByTestId('note-editor')).getByText('editable')
        ).toBeInTheDocument()
    })

    test('shows a success toast after creating a note', async () => {
        const createdNote = buildNote({
            _id: 'new',
            title: 'Untitled'
        })

        setNoteStoreState([...defaultNotes, createdNote])
        mockCreateNote.mockResolvedValueOnce(createdNote)

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Create note'))

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                'created and opened a new note successfully'
            )
        })
    })

    test('shows an error toast when note creation fails', async () => {
        mockCreateNote.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'create failed'
                }
            }
        })

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Create note'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('create failed')
        })

        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument()
    })

    test('opens an existing note in read-only mode', () => {
        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        const editor = screen.getByTestId('note-editor')

        expect(within(editor).getByText('First Note')).toBeInTheDocument()
        expect(within(editor).getByText('readonly')).toBeInTheDocument()
    })

    test('closes the editor and clears the selected note', () => {
        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        fireEvent.click(
            within(screen.getByTestId('note-editor')).getByText('close-editor')
        )

        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument()
    })

    test('updates a note through the editor', async () => {
        const updatedNote = buildNote({
            _id: 'a',
            title: 'Updated Title',
            content: '<p>Updated content</p>'
        })

        mockUpdateNote.mockResolvedValueOnce(updatedNote)

        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        fireEvent.click(
            within(screen.getByTestId('note-editor')).getByText('save-editor')
        )

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'a',
                expect.objectContaining({
                    _id: 'a'
                })
            )
        })
    })
})

describe('Dashboard pinning', () => {
    test('pins an unpinned note', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('pin-First Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'a',
                expect.objectContaining({
                    is_pinned: true
                })
            )
        })
    })

    test('unpins a pinned note from the all view', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('unpin-Second Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'b',
                expect.objectContaining({
                    is_pinned: false
                })
            )
        })
    })

    test('unpins a pinned note from the pinned view', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))
        fireEvent.click(screen.getByLabelText('unpin-Second Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'b',
                expect.objectContaining({
                    is_pinned: false
                })
            )
        })
    })

    test('closes the editor after toggling a pin', async () => {
        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        fireEvent.click(screen.getByLabelText('pin-First Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalled()
        })

        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument()
    })

    test('shows an error toast when pinning fails', async () => {
        mockUpdateNote.mockRejectedValueOnce(new Error('boom'))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('pin-First Note'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })
})

describe('Dashboard archive and restore', () => {
    test('archives a note and unpins it', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('archive-First Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'a',
                expect.objectContaining({
                    is_archived: true,
                    is_pinned: false
                })
            )
        })

        expect(toast.success).toHaveBeenCalledWith('Note archived')
    })

    test('does not show archive action outside the all view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))

        expect(
            screen.queryByLabelText('archive-Second Note')
        ).not.toBeInTheDocument()
    })

    test('restores an archived note', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Archived notes'))
        fireEvent.click(screen.getByLabelText('restore-Archived Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'c',
                expect.objectContaining({
                    is_archived: false
                })
            )
        })

        expect(toast.success).toHaveBeenCalledWith('Note restored')
    })

    test('restores a binned note', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))
        fireEvent.click(screen.getByLabelText('restore-Binned Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'd',
                expect.objectContaining({
                    is_binned: false
                })
            )
        })

        expect(toast.success).toHaveBeenCalledWith('Note restored')
    })

    test('does not show restore action in the all view', () => {
        render(<Dashboard />)

        expect(
            screen.queryByLabelText('restore-First Note')
        ).not.toBeInTheDocument()
    })

    test('shows an error toast when archiving fails', async () => {
        mockUpdateNote.mockRejectedValueOnce(new Error('boom'))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('archive-First Note'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })

    test('shows an error toast when restoring fails', async () => {
        mockUpdateNote.mockRejectedValueOnce(new Error('boom'))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Archived notes'))
        fireEvent.click(screen.getByLabelText('restore-Archived Note'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })
})

describe('Dashboard deletion', () => {
    test('moves a note to the bin from the all view', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('delete-First Note'))

        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith(
                'a',
                expect.objectContaining({
                    is_binned: true,
                    is_pinned: false,
                    is_archived: false
                })
            )
        })

        expect(toast.success).toHaveBeenCalledWith('Note Deleted')
        expect(mockDeleteNote).not.toHaveBeenCalled()
    })

    test('permanently deletes a note from the binned view', async () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))
        fireEvent.click(
            screen.getByLabelText('delete-permanent-Binned Note')
        )

        await waitFor(() => {
            expect(mockDeleteNote).toHaveBeenCalledWith('d')
        })

        expect(mockUpdateNote).not.toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith(
            'Note Deleted Permanently'
        )
    })

    test('uses permanent delete in the binned view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))

        expect(
            screen.getByLabelText('delete-permanent-Binned Note')
        ).toBeInTheDocument()

        expect(
            screen.queryByLabelText('delete-Binned Note')
        ).not.toBeInTheDocument()
    })

    test('shows a normal delete action outside the binned view', () => {
        render(<Dashboard />)

        expect(
            screen.getByLabelText('delete-First Note')
        ).toBeInTheDocument()
    })

    test('shows an error toast when deletion fails', async () => {
        mockUpdateNote.mockRejectedValueOnce(new Error('boom'))

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('delete-First Note'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })
})

describe('Dashboard export', () => {
    let mockLink

    beforeEach(() => {
        mockLink = {
            href: '',
            download: '',
            click: jest.fn()
        }

        jest.spyOn(document, 'createElement').mockImplementation((tag) =>
            tag === 'a'
                ? mockLink
                : originalCreateElement(tag)
        )

        window.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
        window.URL.revokeObjectURL = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('exports a note using the filename from the response header', async () => {
        mockExportNote.mockResolvedValueOnce({
            headers: {
                'content-disposition':
                    'attachment; filename="myfile.txt"'
            },
            data: new Blob(['hello'])
        })

        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        fireEvent.click(
            within(screen.getByTestId('note-editor')).getByText('export-editor')
        )

        await waitFor(() => {
            expect(mockExportNote).toHaveBeenCalledWith('a')
        })

        expect(mockLink.download).toBe('myfile.txt')
        expect(mockLink.href).toBe('blob:mock-url')
        expect(mockLink.click).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
                'blob:mock-url'
            )
        })
    })

    test('falls back to the note title when no filename is provided', async () => {
        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        fireEvent.click(
            within(screen.getByTestId('note-editor')).getByText('export-editor')
        )

        await waitFor(() => {
            expect(mockLink.download).toBe('First Note.txt')
        })
    })

    test('shows an error toast when export fails', async () => {
        mockExportNote.mockRejectedValueOnce(new Error('boom'))

        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        fireEvent.click(
            within(screen.getByTestId('note-editor')).getByText('export-editor')
        )

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })
})

describe('Dashboard import', () => {
    test('opens the file picker when the import button is clicked', () => {
        const clickSpy = jest
            .spyOn(HTMLInputElement.prototype, 'click')
            .mockImplementation(() => {})

        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Import note'))

        expect(clickSpy).toHaveBeenCalledTimes(1)

        clickSpy.mockRestore()
    })

    test('imports the selected file and shows a success toast', async () => {
        const { container } = render(<Dashboard />)

        const file = new File(
            ['note content'],
            'note.txt',
            {
                type: 'text/plain'
            }
        )

        const input = container.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: [file]
            }
        })

        await waitFor(() => {
            expect(mockImportNote).toHaveBeenCalledWith(file)
        })

        expect(toast.success).toHaveBeenCalledWith(
            'Note imported successfully'
        )
    })

    test('clears the input after import', async () => {
        const { container } = render(<Dashboard />)

        const file = new File(
            ['note content'],
            'note.txt',
            {
                type: 'text/plain'
            }
        )

        const input = container.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: [file]
            }
        })

        await waitFor(() => {
            expect(mockImportNote).toHaveBeenCalledWith(file)
        })

        expect(input.value).toBe('')
    })

    test('shows an error toast when import fails', async () => {
        mockImportNote.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'invalid file'
                }
            }
        })

        const { container } = render(<Dashboard />)

        const file = new File(
            ['note content'],
            'note.txt',
            {
                type: 'text/plain'
            }
        )

        const input = container.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: [file]
            }
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('invalid file')
        })

        expect(input.value).toBe('')
    })

    test('uses the default error when import fails without a response message', async () => {
        mockImportNote.mockRejectedValueOnce(new Error('boom'))

        const { container } = render(<Dashboard />)

        const file = new File(
            ['note content'],
            'note.txt',
            {
                type: 'text/plain'
            }
        )

        const input = container.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: [file]
            }
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })

        expect(input.value).toBe('')
    })

    test('does nothing when no file is selected', () => {
        const { container } = render(<Dashboard />)

        const input = container.querySelector('input[type="file"]')

        fireEvent.change(input, {
            target: {
                files: []
            }
        })

        expect(mockImportNote).not.toHaveBeenCalled()
        expect(toast.success).not.toHaveBeenCalled()
        expect(toast.error).not.toHaveBeenCalled()
    })

    test('hides the import button outside the all view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))

        expect(
            screen.queryByLabelText('Import note')
        ).not.toBeInTheDocument()
    })
})

describe('Dashboard editor actions by view', () => {
    test('provides archive action in the all view', () => {
        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        expect(
            within(screen.getByTestId('note-editor')).getByText('archive-editor')
        ).toBeInTheDocument()
    })

    test('does not provide archive action outside the all view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Pinned notes'))
        fireEvent.click(
            within(screen.getByTestId('notecard-Second Note')).getByText('Second Note')
        )

        expect(
            within(screen.getByTestId('note-editor')).queryByText('archive-editor')
        ).not.toBeInTheDocument()
    })

    test('provides restore action in the archived view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Archived notes'))
        fireEvent.click(
            within(screen.getByTestId('notecard-Archived Note')).getByText('Archived Note')
        )

        expect(
            within(screen.getByTestId('note-editor')).getByText('restore-editor')
        ).toBeInTheDocument()
    })

    test('provides restore action in the binned view', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByLabelText('Binned notes'))
        fireEvent.click(
            within(screen.getByTestId('notecard-Binned Note')).getByText('Binned Note')
        )

        expect(
            within(screen.getByTestId('note-editor')).getByText('restore-editor')
        ).toBeInTheDocument()
    })

    test('does not provide restore action in the all view', () => {
        render(<Dashboard />)

        fireEvent.click(
            within(screen.getByTestId('notecard-First Note')).getByText('First Note')
        )

        expect(
            within(screen.getByTestId('note-editor')).queryByText('restore-editor')
        ).not.toBeInTheDocument()
    })
})

describe('Dashboard profile', () => {
    test('shows the user picture and name in the profile trigger', () => {
        render(<Dashboard />)

        expect(
            screen.getByRole('button', { name: /profile/i })
        ).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    test('shows a fallback icon when no user has loaded yet', () => {
        setProfileStoreState(null)

        render(<Dashboard />)

        expect(screen.getByTestId('icon-user-round')).toBeInTheDocument()
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
    })

    test('opens the profile modal', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByRole('button', { name: /profile/i }))

        expect(screen.getByTestId('profile-modal')).toBeInTheDocument()
    })

    test('closes the profile modal', () => {
        render(<Dashboard />)

        fireEvent.click(screen.getByRole('button', { name: /profile/i }))

        fireEvent.click(
            within(screen.getByTestId('profile-modal')).getByText('close-profile')
        )

        expect(
            screen.queryByTestId('profile-modal')
        ).not.toBeInTheDocument()
    })
})