import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NoteCard } from '../../src/components/NoteCard.jsx'
import DOMPurify from 'dompurify'

jest.mock('dompurify', () => ({
    __esModule: true,
    default: {
        sanitize: jest.fn((html) => html)
    }
}))

jest.mock('lucide-react', () => ({
    Pin: () => <svg data-testid="icon-pin" />,
    PinOff: () => <svg data-testid="icon-pin-off" />,
    Archive: () => <svg data-testid="icon-archive" />,
    ArchiveRestore: () => <svg data-testid="icon-restore" />,
    Trash2: () => <svg data-testid="icon-trash" />
}))

const buildProps = (overrides = {}) => ({
    title: 'My Note',
    content: '<p>Some content</p>',
    onClick: jest.fn(),
    isPinned: false,
    onPin: jest.fn(),
    onArchive: jest.fn(),
    onRestore: jest.fn(),
    onDelete: jest.fn(),
    isPermanentDelete: false,
    ...overrides
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('NoteCard rendering', () => {
    test('renders the title', () => {
        render(<NoteCard {...buildProps()} />)
        expect(screen.getByText('My Note')).toBeInTheDocument()
    })

    test('renders sanitized content', () => {
        render(<NoteCard {...buildProps({ content: '<p>Some content</p>' })} />)
        expect(DOMPurify.sanitize).toHaveBeenCalledWith('<p>Some content</p>')
        expect(screen.getByText('Some content')).toBeInTheDocument()
    })

    test('renders pin button when onPin is provided', () => {
        render(<NoteCard {...buildProps()} />)
        expect(screen.getByLabelText('Pin note')).toBeInTheDocument()
    })

    test('does not render pin button when onPin is not provided', () => {
        render(<NoteCard {...buildProps({ onPin: undefined })} />)
        expect(screen.queryByLabelText('Pin note')).not.toBeInTheDocument()
    })

    test('renders Pin icon when isPinned is false', () => {
        render(<NoteCard {...buildProps({ isPinned: false })} />)
        expect(screen.getByTestId('icon-pin')).toBeInTheDocument()
        expect(screen.queryByTestId('icon-pin-off')).not.toBeInTheDocument()
    })

    test('renders PinOff icon when isPinned is true', () => {
        render(<NoteCard {...buildProps({ isPinned: true })} />)
        expect(screen.getByTestId('icon-pin-off')).toBeInTheDocument()
        expect(screen.queryByTestId('icon-pin')).not.toBeInTheDocument()
    })

    test('renders archive button when onArchive is provided', () => {
        render(<NoteCard {...buildProps()} />)
        expect(screen.getByLabelText('Archive note')).toBeInTheDocument()
    })

    test('does not render archive button when onArchive is not provided', () => {
        render(<NoteCard {...buildProps({ onArchive: undefined })} />)
        expect(screen.queryByLabelText('Archive note')).not.toBeInTheDocument()
    })

    test('renders restore button when onRestore is provided', () => {
        render(<NoteCard {...buildProps()} />)
        expect(screen.getByLabelText('Restore note')).toBeInTheDocument()
    })

    test('does not render restore button when onRestore is not provided', () => {
        render(<NoteCard {...buildProps({ onRestore: undefined })} />)
        expect(screen.queryByLabelText('Restore note')).not.toBeInTheDocument()
    })

    test('renders delete button when onDelete is provided', () => {
        render(<NoteCard {...buildProps()} />)
        expect(screen.getByLabelText('Move note to bin')).toBeInTheDocument()
    })

    test('does not render delete button when onDelete is not provided', () => {
        render(<NoteCard {...buildProps({ onDelete: undefined })} />)
        expect(screen.queryByLabelText('Move note to bin')).not.toBeInTheDocument()
    })

    test('renders permanent delete label when isPermanentDelete is true', () => {
        render(<NoteCard {...buildProps({ isPermanentDelete: true })} />)
        expect(screen.getByLabelText('Delete note permanently')).toBeInTheDocument()
    })

    test('has role button and is focusable', () => {
        const { container } = render(<NoteCard {...buildProps()} />)
        const card = container.querySelector('[role="button"]')
        expect(card).toHaveAttribute('tabIndex', '0')
    })

    test('renders Unpin note label when isPinned is true', () => {
        render(<NoteCard {...buildProps({ isPinned: true })} />)
        expect(screen.getByLabelText('Unpin note')).toBeInTheDocument()
        expect(screen.queryByLabelText('Pin note')).not.toBeInTheDocument()
    })
})

describe('NoteCard interactions', () => {
    test('calls onClick when the card is clicked', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.click(screen.getByText('My Note'))
        expect(props.onClick).toHaveBeenCalledTimes(1)
    })

    test('calls onClick when Enter key is pressed', () => {
        const props = buildProps()
        const { container } = render(<NoteCard {...props} />)
        fireEvent.keyDown(container.firstChild, { key: 'Enter' })
        expect(props.onClick).toHaveBeenCalledTimes(1)
    })

    test('calls onClick when Space key is pressed', () => {
        const props = buildProps()
        const { container } = render(<NoteCard {...props} />)
        fireEvent.keyDown(container.firstChild, { key: ' ' })
        expect(props.onClick).toHaveBeenCalledTimes(1)
    })

    test('does not call onClick on unrelated key press', () => {
        const props = buildProps()
        const { container } = render(<NoteCard {...props} />)
        fireEvent.keyDown(container.firstChild, { key: 'Tab' })
        expect(props.onClick).not.toHaveBeenCalled()
    })

    test('calls onPin without triggering onClick', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.click(screen.getByLabelText('Pin note'))
        expect(props.onPin).toHaveBeenCalledTimes(1)
        expect(props.onClick).not.toHaveBeenCalled()
    })

    test('calls onArchive without triggering onClick', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.click(screen.getByLabelText('Archive note'))
        expect(props.onArchive).toHaveBeenCalledTimes(1)
        expect(props.onClick).not.toHaveBeenCalled()
    })

    test('calls onRestore without triggering onClick', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.click(screen.getByLabelText('Restore note'))
        expect(props.onRestore).toHaveBeenCalledTimes(1)
        expect(props.onClick).not.toHaveBeenCalled()
    })

    test('calls onDelete without triggering onClick', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.click(screen.getByLabelText('Move note to bin'))
        expect(props.onDelete).toHaveBeenCalledTimes(1)
        expect(props.onClick).not.toHaveBeenCalled()
    })

    test('does not call onClick when Enter is pressed while a pin button is focused', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.keyDown(screen.getByLabelText('Pin note'), { key: 'Enter' })
        expect(props.onClick).not.toHaveBeenCalled()
    })

    test('does not call onClick when Space is pressed while a delete button is focused', () => {
        const props = buildProps()
        render(<NoteCard {...props} />)
        fireEvent.keyDown(screen.getByLabelText('Move note to bin'), { key: ' ' })
        expect(props.onClick).not.toHaveBeenCalled()
    })
})