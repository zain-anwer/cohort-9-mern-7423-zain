import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteEditor } from '../../src/components/NoteEditor'

describe('NoteEditor', () => {
    it('renders the Quill editor and accepts text input', async () => {
        render(<NoteEditor />)

        const editor = screen.getByRole('textbox')
        expect(editor).toBeInTheDocument()

        await userEvent.type(editor, 'Hello world')
        expect(editor).toHaveTextContent('Hello world')
    })
})