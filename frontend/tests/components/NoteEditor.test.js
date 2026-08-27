import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NoteEditor } from '../../src/components/NoteEditor.jsx'
import toast from 'react-hot-toast'

jest.mock('../../src/utils/socket', () => ({
    connectSocket: jest.fn(),
    disconnectSocket: jest.fn()
}))

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        success: jest.fn()
    }
}))

jest.mock('react-quill-new', () => {
    return function MockReactQuill({ value, onChange, readOnly }) {
        return (
            <textarea
                data-testid="quill-editor"
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange(e.target.value)}
            />
        )
    }
})

jest.mock('lucide-react', () => ({
    CircleX: () => <svg data-testid="icon-close" />,
    Pencil: () => <svg data-testid="icon-pencil" />,
    Trash2: () => <svg data-testid="icon-trash" />,
    Archive: () => <svg data-testid="icon-archive" />,
    ArchiveRestore: () => <svg data-testid="icon-restore" />,
    Download: () => <svg data-testid="icon-download" />
}))

const buildNote = (overrides = {}) => ({
    _id: '1',
    title: 'My Note',
    content: 'Some content',
    ...overrides
})

const buildProps = (overrides = {}) => ({
    note: buildNote(),
    onSave: jest.fn().mockResolvedValue({}),
    onDelete: jest.fn(),
    onArchive: jest.fn(),
    onRestore: jest.fn(),
    onExport: jest.fn(),
    isPermanentDelete: false,
    onClose: jest.fn(),
    isReadOnly: false,
    setIsReadOnly: jest.fn(),
    ...overrides
})

beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
})

afterEach(() => {
    act(() => {
        jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
})

describe('NoteEditor rendering', () => {
    test('renders note title and content', () => {
        render(<NoteEditor {...buildProps()} />)
        expect(screen.getByDisplayValue('My Note')).toBeInTheDocument()
        expect(screen.getByTestId('quill-editor')).toHaveValue('Some content')
    })

    test('renders Untitled when note has no title', () => {
        render(<NoteEditor {...buildProps({ note: buildNote({ title: undefined }) })} />)
        expect(screen.getByDisplayValue('Untitled')).toBeInTheDocument()
    })

    test('shows read only badge when isReadOnly is true', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: true })} />)
        expect(screen.getByText('Read only')).toBeInTheDocument()
    })

    test('does not show read only badge when isReadOnly is false', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: false })} />)
        expect(screen.queryByText('Read only')).not.toBeInTheDocument()
    })

    test('renders archive button when onArchive is provided', () => {
        render(<NoteEditor {...buildProps()} />)
        expect(screen.getByLabelText('Archive note')).toBeInTheDocument()
    })

    test('does not render archive button when onArchive is not provided', () => {
        render(<NoteEditor {...buildProps({ onArchive: undefined })} />)
        expect(screen.queryByLabelText('Archive note')).not.toBeInTheDocument()
    })

    test('renders restore button when onRestore is provided', () => {
        render(<NoteEditor {...buildProps()} />)
        expect(screen.getByLabelText('Restore note')).toBeInTheDocument()
    })

    test('does not render restore button when onRestore is not provided', () => {
        render(<NoteEditor {...buildProps({ onRestore: undefined })} />)
        expect(screen.queryByLabelText('Restore note')).not.toBeInTheDocument()
    })

    test('renders edit button when readOnly and not permanent delete', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: true, isPermanentDelete: false })} />)
        expect(screen.getByLabelText('Edit note')).toBeInTheDocument()
    })

    test('does not render edit button when not readOnly', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: false })} />)
        expect(screen.queryByLabelText('Edit note')).not.toBeInTheDocument()
    })

    test('does not render edit button when isPermanentDelete is true', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: true, isPermanentDelete: true })} />)
        expect(screen.queryByLabelText('Edit note')).not.toBeInTheDocument()
    })

    test('renders permanent delete label on delete button when isPermanentDelete is true', () => {
        render(<NoteEditor {...buildProps({ isPermanentDelete: true })} />)
        expect(screen.getByLabelText('Delete note permanently')).toBeInTheDocument()
    })

    test('renders move to bin label on delete button when isPermanentDelete is false', () => {
        render(<NoteEditor {...buildProps({ isPermanentDelete: false })} />)
        expect(screen.getByLabelText('Move note to bin')).toBeInTheDocument()
    })
})

describe('NoteEditor interactions', () => {
    test('calls onClose when close button is clicked', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        fireEvent.click(screen.getByLabelText('Close'))
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    test('calls onDelete with note when delete button is clicked', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        fireEvent.click(screen.getByLabelText('Move note to bin'))
        expect(props.onDelete).toHaveBeenCalledWith(props.note)
    })

    test('calls onArchive when archive button is clicked', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        fireEvent.click(screen.getByLabelText('Archive note'))
        expect(props.onArchive).toHaveBeenCalledTimes(1)
    })

    test('calls onRestore when restore button is clicked', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        fireEvent.click(screen.getByLabelText('Restore note'))
        expect(props.onRestore).toHaveBeenCalledTimes(1)
    })

    test('calls onExport when export button is clicked', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        fireEvent.click(screen.getByLabelText('Export note'))
        expect(props.onExport).toHaveBeenCalledTimes(1)
    })

    test('calls setIsReadOnly with false when edit button is clicked', () => {
        const props = buildProps({ isReadOnly: true })
        render(<NoteEditor {...props} />)
        fireEvent.click(screen.getByLabelText('Edit note'))
        expect(props.setIsReadOnly).toHaveBeenCalledWith(false)
    })

    test('title input is read only when isReadOnly is true', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: true })} />)
        expect(screen.getByDisplayValue('My Note')).toHaveAttribute('readonly')
    })

    test('title input is editable when isReadOnly is false', () => {
        render(<NoteEditor {...buildProps({ isReadOnly: false })} />)
        expect(screen.getByDisplayValue('My Note')).not.toHaveAttribute('readonly')
    })

    test('updates title value on change', () => {
        render(<NoteEditor {...buildProps()} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: 'Updated title' } })
        expect(screen.getByDisplayValue('Updated title')).toBeInTheDocument()
    })

    test('updates content value on change', () => {
        render(<NoteEditor {...buildProps()} />)
        const editor = screen.getByTestId('quill-editor')
        fireEvent.change(editor, { target: { value: 'Updated content' } })
        expect(editor).toHaveValue('Updated content')
    })
})

describe('NoteEditor autosave', () => {
    test('calls onSave after inactivity when title or content changes', async () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: 'Changed title' } })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        await waitFor(() => {
            expect(props.onSave).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Changed title' }))
        })
    })

    test('shows saving indicator before timeout elapses', () => {
        render(<NoteEditor {...buildProps()} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: 'Changed title' } })
        expect(screen.getByText('saving...')).toBeInTheDocument()
    })

    test('shows saved indicator after onSave resolves', async () => {
        render(<NoteEditor {...buildProps()} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: 'Changed title' } })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        await waitFor(() => {
            expect(screen.getByText('saved')).toBeInTheDocument()
        })
    })

    test('does not call onSave when isReadOnly is true', () => {
        const props = buildProps({ isReadOnly: true })
        render(<NoteEditor {...props} />)

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(props.onSave).not.toHaveBeenCalled()
    })

    test('does not call onSave when title is empty', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: '   ' } })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(props.onSave).not.toHaveBeenCalled()
    })

    test('does not call onSave when nothing has changed', () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(props.onSave).not.toHaveBeenCalled()
    })

    test('debounces rapid consecutive changes into a single save', async () => {
        const props = buildProps()
        render(<NoteEditor {...props} />)
        const input = screen.getByDisplayValue('My Note')

        fireEvent.change(input, { target: { value: 'A' } })
        act(() => {
            jest.advanceTimersByTime(500)
        })
        fireEvent.change(input, { target: { value: 'AB' } })
        act(() => {
            jest.advanceTimersByTime(500)
        })
        fireEvent.change(input, { target: { value: 'ABC' } })
        act(() => {
            jest.advanceTimersByTime(1000)
        })

        await waitFor(() => {
            expect(props.onSave).toHaveBeenCalledTimes(1)
            expect(props.onSave).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'ABC' }))
        })
    })

    test('shows error toast when onSave rejects', async () => {
        const props = buildProps({
            onSave: jest.fn().mockRejectedValue({ response: { data: { message: 'save failed' } } })
        })
        render(<NoteEditor {...props} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: 'Changed title' } })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('save failed')
        })
    })

    test('shows generic error toast when rejection has no message', async () => {
        const props = buildProps({
            onSave: jest.fn().mockRejectedValue(new Error('boom'))
        })
        render(<NoteEditor {...props} />)
        const input = screen.getByDisplayValue('My Note')
        fireEvent.change(input, { target: { value: 'Changed title' } })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something went wrong')
        })
    })
})

describe('NoteEditor note switching', () => {
    test('resets title and content when note id changes', () => {
        const props = buildProps()
        const { rerender } = render(<NoteEditor {...props} />)
        rerender(<NoteEditor {...props} note={buildNote({ _id: '2', title: 'Second Note', content: 'Second content' })} />)
        expect(screen.getByDisplayValue('Second Note')).toBeInTheDocument()
        expect(screen.getByTestId('quill-editor')).toHaveValue('Second content')
    })

    test('resets to Untitled when switching to a note without a title', () => {
        const props = buildProps()
        const { rerender } = render(<NoteEditor {...props} />)
        rerender(<NoteEditor {...props} note={buildNote({ _id: '2', title: undefined })} />)
        expect(screen.getByDisplayValue('Untitled')).toBeInTheDocument()
    })
})