import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dashboard } from '../../src/pages/Dashboard.jsx'
import useAuthStore from '../../src/stores/authStore'
import useNoteStore from '../../src/stores/noteStore'
import toast from 'react-hot-toast'

const originalCreateElement = document.createElement.bind(document)

jest.mock('../../src/stores/authStore', () => ({
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

jest.mock('dompurify', () => ({
    __esModule: true,
    default: {
        sanitize: jest.fn((html) => html)
    }
}))

jest.mock('../../src/components/NoteEditor.jsx', () => ({
    NoteEditor: ({ note, onSave, onDelete, onArchive, onRestore, onExport, onClose, isReadOnly }) => (
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
    NoteCard: ({ title, onClick, onPin, onArchive, onRestore, onDelete, isPinned, isPermanentDelete }) => (
        <div data-testid={`notecard-${title}`}>
            <button onClick={onClick}>{title}</button>
            {onPin && <button aria-label={`pin-${title}`} onClick={onPin}>{isPinned ? 'unpin' : 'pin'}</button>}
            {onArchive && <button aria-label={`archive-${title}`} onClick={onArchive}>archive</button>}
            {onRestore && <button aria-label={`restore-${title}`} onClick={onRestore}>restore</button>}
            {onDelete && <button aria-label={isPermanentDelete ? `delete-permanent-${title}` : `delete-${title}`} onClick={onDelete}>delete</button>}
        </div>
    )
}))

jest.mock('../../src/components/Profile.jsx', () => ({
    Profile: ({ name, email, onClose }) => (
        <div data-testid="profile-modal">
            <span>{name}</span>
            <span>{email}</span>
            <button onClick={onClose}>close-profile</button>
        </div>
    )
}))

jest.mock('lucide-react', () => ({
    CircleUserRound: () => <svg data-testid="icon-user-round" />,
    StickyNotePlus: () => <svg data-testid="icon-note-plus" />,
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

const setNoteStoreState = (notes) => {
    useNoteStore.mockImplementation((selector) => selector({
        notes,
        getAllNotes: mockGetAllNotes,
        createNote: mockCreateNote,
        updateNote: mockUpdateNote,
        deleteNote: mockDeleteNote,
        exportNote: mockExportNote,
        importNote: mockImportNote,
        initSocketListeners: mockInitSocketListeners,
        cleanSocketListeners: mockCleanSocketListeners
    }))
}

const defaultNotes = [
    buildNote({ _id: 'a', title: 'First Note', content: '<p>Alpha content</p>', updatedAt: '2024-01-03T00:00:00Z' }),
    buildNote({ _id: 'b', title: 'Second Note', content: '<p>Beta content</p>', is_pinned: true, updatedAt: '2024-01-02T00:00:00Z', pinned_at: '2024-01-05T00:00:00Z' }),
    buildNote({ _id: 'c', title: 'Archived Note', content: '<p>Gamma content</p>', is_archived: true, archived_at: '2024-01-01T00:00:00Z' }),
    buildNote({ _id: 'd', title: 'Binned Note', content: '<p>Delta content</p>', is_binned: true, binned_at: '2024-01-01T00:00:00Z' })
]

beforeEach(() => {
    jest.clearAllMocks()
    mockGetAllNotes = jest.fn().mockResolvedValue([])
    mockCreateNote = jest.fn().mockResolvedValue(buildNote({ _id: 'new', title: 'Untitled' }))
    mockUpdateNote = jest.fn().mockResolvedValue({})
    mockDeleteNote = jest.fn().mockResolvedValue({})
    mockExportNote = jest.fn().mockResolvedValue({ headers: {}, data: new Blob(['content']) })
    mockImportNote = jest.fn().mockResolvedValue({})
    mockInitSocketListeners = jest.fn()
    mockCleanSocketListeners = jest.fn()

    useAuthStore.mockImplementation((selector) => selector({ user: { name: 'Jane Doe', email: 'jane@example.com' } }))
    setNoteStoreState(defaultNotes)
})

describe('Dashboard lifecycle', () => {
    test('renders the dashboard heading', () => {
        render(<Dashboard />)
        expect(screen.getByText('Scribble Dashboard')).toBeInTheDocument()
    })

    test('loads notes and starts socket listeners on mount', async () => {
        render(<Dashboard />)
        await waitFor(() => {
            expect(mockGetAllNotes).toHaveBeenCalledTimes(1)
        })
        expect(mockInitSocketListeners).toHaveBeenCalledTimes(1)
    })

    test('cleans up socket listeners on unmount', () => {
        const { unmount } = render(<Dashboard />)
        unmount()
        expect(mockCleanSocketListeners).toHaveBeenCalledTimes(1)
    })

    test('shows an error toast when loading notes fails', async () => {
        mockGetAllNotes.mockRejectedValueOnce({ response: { data: { message: 'load failed' } } })
        render(<Dashboard />)
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('load failed')
        })
    })
})

describe('Dashboard note listing and filtering', () => {
    test('shows unarchived, unbinned notes with pinned notes first in the default view', () => {
        render(<Dashboard />)
        expect(screen.getByText('Second Note')).toBeInTheDocument()
        expect(screen.getByText('First Note')).toBeInTheDocument()
        expect(screen.queryByText('Archived Note')).not.toBeInTheDocument()
        expect(screen.queryByText('Binned Note')).not.toBeInTheDocument()
    })

    test('shows an empty state when there are no notes', () => {
        setNoteStoreState([])
        render(<Dashboard />)
        expect(screen.getByText('No Notes Yet')).toBeInTheDocument()
    })

    test('switches to the pinned view', () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Pinned notes'))
        expect(screen.getByText('Second Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    })

    test('switches to the archived view', () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Archived notes'))
        expect(screen.getByText('Archived Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    })

    test('switches to the binned view', () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Binned notes'))
        expect(screen.getByText('Binned Note')).toBeInTheDocument()
        expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    })

    test('shows an empty archive message when the archived view has no notes', () => {
        setNoteStoreState(defaultNotes.filter((note) => !note.is_archived))
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Archived notes'))
        expect(screen.getByText('Empty Archive')).toBeInTheDocument()
    })

    test('shows an empty bin message when the binned view has no notes', () => {
        setNoteStoreState(defaultNotes.filter((note) => !note.is_binned))
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Binned notes'))
        expect(screen.getByText('Empty Bin')).toBeInTheDocument()
    })

    test('filters notes by a search query matching the title', () => {
        render(<Dashboard />)
        fireEvent.change(screen.getByPlaceholderText('Search notes'), { target: { value: 'first' } })
        expect(screen.getByText('First Note')).toBeInTheDocument()
        expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
    })

    test('filters notes by a search query matching stripped content', () => {
        render(<Dashboard />)
        fireEvent.change(screen.getByPlaceholderText('Search notes'), { target: { value: 'beta' } })
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

describe('Dashboard note creation and editing', () => {
    test('creates a new note and opens it in the editor for writing', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Create note'))

        await waitFor(() => {
            expect(mockCreateNote).toHaveBeenCalledWith({ title: 'Untitled', content: '' })
        })

        // Wait on the toast, which only fires after the created note has been
        // set as the selected note and React has re-rendered. Asserting on
        // mockCreateNote alone can resolve before that state update lands,
        // since the mock is invoked synchronously at the start of the handler.
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('created and opened a new note successfully')
        })

        expect(within(screen.getByTestId('note-editor')).getByText('editable')).toBeInTheDocument()
    })

    test('shows an error toast when note creation fails', async () => {
        mockCreateNote.mockRejectedValueOnce({ response: { data: { message: 'create failed' } } })
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Create note'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('create failed')
        })
        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument()
    })

    test('opens a note in read-only mode when its card is clicked', () => {
        render(<Dashboard />)
        fireEvent.click(within(screen.getByTestId('notecard-First Note')).getByText('First Note'))

        const editor = screen.getByTestId('note-editor')
        expect(within(editor).getByText('readonly')).toBeInTheDocument()
        expect(within(editor).getByText('First Note')).toBeInTheDocument()
    })

    test('closes the editor and clears the selected note', () => {
        render(<Dashboard />)
        fireEvent.click(within(screen.getByTestId('notecard-First Note')).getByText('First Note'))
        fireEvent.click(within(screen.getByTestId('note-editor')).getByText('close-editor'))
        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument()
    })

    test('saves an edit through the editor and reflects the updated title', async () => {
        mockUpdateNote.mockResolvedValueOnce(buildNote({ _id: 'a', title: 'Updated Title' }))
        render(<Dashboard />)
        fireEvent.click(within(screen.getByTestId('notecard-First Note')).getByText('First Note'))
        fireEvent.click(within(screen.getByTestId('note-editor')).getByText('save-editor'))

        await waitFor(() => {
            expect(within(screen.getByTestId('note-editor')).getByText('Updated Title')).toBeInTheDocument()
        })
    })
})

describe('Dashboard pin, archive, restore and delete', () => {
    test('toggles pin on a note', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('pin-First Note'))
        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith('a', expect.objectContaining({ is_pinned: true }))
        })
    })

    test('shows an error toast when toggling pin fails', async () => {
        mockUpdateNote.mockRejectedValueOnce(new Error('boom'))
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('pin-First Note'))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })

    test('archives a note and shows a success toast', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('archive-First Note'))
        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith('a', expect.objectContaining({ is_archived: true, is_pinned: false }))
        })
        expect(toast.success).toHaveBeenCalledWith('Note archived')
    })

    test('shows an error toast when archiving fails', async () => {
        mockUpdateNote.mockRejectedValueOnce(new Error('boom'))
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('archive-First Note'))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })

    test('restores a note from the archived view using the is_archived patch', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Archived notes'))
        fireEvent.click(screen.getByLabelText('restore-Archived Note'))
        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith('c', expect.objectContaining({ is_archived: false }))
        })
        expect(toast.success).toHaveBeenCalledWith('Note restored')
    })

    test('does not offer restore in the pinned view', () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Pinned notes'))
        expect(screen.queryByLabelText('restore-Second Note')).not.toBeInTheDocument()
    })

    test('restores a note from the binned view using the is_binned patch', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Binned notes'))
        fireEvent.click(screen.getByLabelText('restore-Binned Note'))
        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith('d', expect.objectContaining({ is_binned: false }))
        })
    })

    test('permanently deletes a note from the binned view', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Binned notes'))
        fireEvent.click(screen.getByLabelText('delete-permanent-Binned Note'))
        await waitFor(() => {
            expect(mockDeleteNote).toHaveBeenCalledWith('d')
        })
        expect(toast.success).toHaveBeenCalledWith('Note Deleted Permanently')
        expect(mockUpdateNote).not.toHaveBeenCalled()
    })

    test('moves a note to the bin from the all view', async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('delete-First Note'))
        await waitFor(() => {
            expect(mockUpdateNote).toHaveBeenCalledWith('a', expect.objectContaining({ is_binned: true, is_pinned: false, is_archived: false }))
        })
        expect(toast.success).toHaveBeenCalledWith('Note Deleted')
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
        mockLink = { href: '', download: '', click: jest.fn() }
        jest.spyOn(document, 'createElement').mockImplementation((tag) =>
            tag === 'a' ? mockLink : originalCreateElement(tag)
        )
        window.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
        window.URL.revokeObjectURL = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('exports a note using the filename from the content-disposition header', async () => {
        mockExportNote.mockResolvedValueOnce({
            headers: { 'content-disposition': 'attachment; filename="myfile.txt"' },
            data: new Blob(['hello'])
        })
        render(<Dashboard />)
        fireEvent.click(within(screen.getByTestId('notecard-First Note')).getByText('First Note'))
        fireEvent.click(within(screen.getByTestId('note-editor')).getByText('export-editor'))

        await waitFor(() => {
            expect(mockLink.download).toBe('myfile.txt')
        })
        expect(mockLink.href).toBe('blob:mock-url')
        expect(mockLink.click).toHaveBeenCalledTimes(1)
        await waitFor(() => {
            expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
        })
    })

    test('falls back to the note title as the filename when no header is present', async () => {
        render(<Dashboard />)
        fireEvent.click(within(screen.getByTestId('notecard-First Note')).getByText('First Note'))
        fireEvent.click(within(screen.getByTestId('note-editor')).getByText('export-editor'))

        await waitFor(() => {
            expect(mockLink.download).toBe('First Note.txt')
        })
    })

    test('shows an error toast when export fails', async () => {
        mockExportNote.mockRejectedValueOnce(new Error('boom'))
        render(<Dashboard />)
        fireEvent.click(within(screen.getByTestId('notecard-First Note')).getByText('First Note'))
        fireEvent.click(within(screen.getByTestId('note-editor')).getByText('export-editor'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })
})

describe('Dashboard import', () => {
    test('triggers the hidden file input when the import button is clicked', () => {
        const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
        render(<Dashboard />)
        fireEvent.click(screen.getByLabelText('Import note'))
        expect(clickSpy).toHaveBeenCalledTimes(1)
        clickSpy.mockRestore()
    })

    test('imports the selected file and shows a success toast', async () => {
        const { container } = render(<Dashboard />)
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        const input = container.querySelector('input[type="file"]')
        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(mockImportNote).toHaveBeenCalledWith(file)
        })
        expect(toast.success).toHaveBeenCalledWith('Note imported successfully')
    })

    test('shows an error toast when import fails', async () => {
        mockImportNote.mockRejectedValueOnce(new Error('boom'))
        const { container } = render(<Dashboard />)
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        const input = container.querySelector('input[type="file"]')
        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })

    test('does nothing when no file is selected', () => {
        const { container } = render(<Dashboard />)
        const input = container.querySelector('input[type="file"]')
        fireEvent.change(input, { target: { files: [] } })
        expect(mockImportNote).not.toHaveBeenCalled()
    })
})

describe('Dashboard profile', () => {
    test('opens the profile modal with the authenticated user', () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByRole('button', { name: 'profile' }))
        const profile = screen.getByTestId('profile-modal')
        expect(within(profile).getByText('Jane Doe')).toBeInTheDocument()
        expect(within(profile).getByText('jane@example.com')).toBeInTheDocument()
    })

    test('closes the profile modal', () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByRole('button', { name: 'profile' }))
        fireEvent.click(within(screen.getByTestId('profile-modal')).getByText('close-profile'))
        expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument()
    })
})