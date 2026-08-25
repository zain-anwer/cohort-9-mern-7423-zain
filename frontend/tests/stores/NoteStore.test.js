import useNoteStore from '../../src/stores/noteStore.js'
import { createNote, updateNote, deleteNote, getNote, getAllNotes, exportNote, importNote } from '../../src/services/noteService.js'
import { getSocket } from '../../src/utils/socket.js'

jest.mock('../../src/services/noteService.js', () => ({
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    getNote: jest.fn(),
    getAllNotes: jest.fn(),
    exportNote: jest.fn(),
    importNote: jest.fn()
}))

jest.mock('../../src/utils/socket.js', () => ({
    getSocket: jest.fn()
}))

const buildNote = (overrides = {}) => ({
    _id: '1',
    title: 'Untitled',
    content: '',
    version: 1,
    ...overrides
})

beforeEach(() => {
    jest.clearAllMocks()
    useNoteStore.setState({ notes: [], error: null })
})

describe('createNote', () => {
    test('adds the created note to state and returns it', async () => {
        const created = buildNote({ _id: 'a', title: 'First Note' })
        createNote.mockResolvedValueOnce({ data: { created_note: created } })

        const result = await useNoteStore.getState().createNote({ title: 'First Note', content: '' })

        expect(createNote).toHaveBeenCalledWith({ title: 'First Note', content: '' })
        expect(result).toEqual(created)
        expect(useNoteStore.getState().notes).toEqual([created])
    })

    test('does not duplicate a note that already exists in state', async () => {
        const existing = buildNote({ _id: 'a' })
        useNoteStore.setState({ notes: [existing] })
        createNote.mockResolvedValueOnce({ data: { created_note: existing } })

        await useNoteStore.getState().createNote({ title: 'Untitled', content: '' })

        expect(useNoteStore.getState().notes).toEqual([existing])
    })

    test('sets an error and rethrows when creation fails', async () => {
        createNote.mockRejectedValueOnce({ response: { data: { message: 'Title required' } } })

        await expect(useNoteStore.getState().createNote({ title: '', content: '' })).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Title required')
    })

    test('falls back to a generic error message when creation fails without a server message', async () => {
        createNote.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().createNote({ title: 'x', content: '' })).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Note Creation Failed')
    })
})

describe('updateNote', () => {
    test('replaces the matching note in state and returns the updated note', async () => {
        const original = buildNote({ _id: 'a', title: 'First Note' })
        const updated = buildNote({ _id: 'a', title: 'Updated Title' })
        useNoteStore.setState({ notes: [original] })
        updateNote.mockResolvedValueOnce({ data: { updated_note: updated } })

        const result = await useNoteStore.getState().updateNote('a', { title: 'Updated Title' })

        expect(updateNote).toHaveBeenCalledWith('a', { title: 'Updated Title' })
        expect(result).toEqual(updated)
        expect(useNoteStore.getState().notes).toEqual([updated])
    })

    test('sets an error and rethrows when update fails', async () => {
        updateNote.mockRejectedValueOnce({ response: { data: { message: 'Note not found' } } })

        await expect(useNoteStore.getState().updateNote('a', { title: 'x' })).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Note not found')
    })

    test('falls back to a generic error message when update fails without a server message', async () => {
        updateNote.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().updateNote('a', { title: 'x' })).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Note Updation Failed')
    })
})

describe('deleteNote', () => {
    test('removes the note from state', async () => {
        const note = buildNote({ _id: 'a' })
        useNoteStore.setState({ notes: [note] })
        deleteNote.mockResolvedValueOnce({})

        await useNoteStore.getState().deleteNote('a')

        expect(deleteNote).toHaveBeenCalledWith('a')
        expect(useNoteStore.getState().notes).toEqual([])
    })

    test('sets an error and rethrows when deletion fails', async () => {
        deleteNote.mockRejectedValueOnce({ response: { data: { message: 'Note not found' } } })

        await expect(useNoteStore.getState().deleteNote('a')).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Note not found')
    })

    test('falls back to a generic error message when deletion fails without a server message', async () => {
        deleteNote.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().deleteNote('a')).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Note Deletion Failed')
    })
})

describe('getNote', () => {
    test('returns the fetched note data', async () => {
        const note = buildNote({ _id: 'a' })
        getNote.mockResolvedValueOnce({ data: note })

        const result = await useNoteStore.getState().getNote('a')

        expect(getNote).toHaveBeenCalledWith('a')
        expect(result).toEqual(note)
    })

    test('sets an error and rethrows when retrieval fails', async () => {
        getNote.mockRejectedValueOnce({ response: { data: { message: 'Note not found' } } })

        await expect(useNoteStore.getState().getNote('a')).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Note not found')
    })

    test('falls back to a generic error message when retrieval fails without a server message', async () => {
        getNote.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().getNote('a')).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Note Retrieval Failed')
    })
})

describe('getAllNotes', () => {
    test('replaces state with the fetched notes when nothing has changed locally', async () => {
        const notes = [buildNote({ _id: 'a' }), buildNote({ _id: 'b' })]
        getAllNotes.mockResolvedValueOnce({ data: notes })

        await useNoteStore.getState().getAllNotes()

        expect(useNoteStore.getState().notes).toEqual(notes)
    })

    test('ignores a stale response that resolves after a newer request', async () => {
        let resolveFirst
        let resolveSecond
        getAllNotes
            .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
            .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve }))

        const firstCall = useNoteStore.getState().getAllNotes()
        const secondCall = useNoteStore.getState().getAllNotes()

        resolveSecond({ data: [buildNote({ _id: 'newer' })] })
        await secondCall
        resolveFirst({ data: [buildNote({ _id: 'stale' })] })
        await firstCall

        expect(useNoteStore.getState().notes).toEqual([buildNote({ _id: 'newer' })])
    })

    test('retains the local note when the fetched version is older', async () => {
        const newerLocal = buildNote({ _id: 'a', version: 3, title: 'Newer Local' })
        useNoteStore.setState({ notes: [newerLocal] })
        getAllNotes.mockResolvedValueOnce({ data: [buildNote({ _id: 'a', version: 1, title: 'Stale Fetched' })] })

        await useNoteStore.getState().getAllNotes()

        expect(useNoteStore.getState().notes).toEqual([newerLocal])
    })

    test('adopts the fetched note when its version is newer than the local one', async () => {
        const staleLocal = buildNote({ _id: 'a', version: 1, title: 'Stale Local' })
        useNoteStore.setState({ notes: [staleLocal] })
        const newerFetched = buildNote({ _id: 'a', version: 2, title: 'Newer Fetched' })
        getAllNotes.mockResolvedValueOnce({ data: [newerFetched] })

        await useNoteStore.getState().getAllNotes()

        expect(useNoteStore.getState().notes).toEqual([newerFetched])
    })

    test('does not crash and adds a fetched note that does not yet exist locally', async () => {
        const brandNew = buildNote({ _id: 'z', version: 1 })
        getAllNotes.mockResolvedValueOnce({ data: [brandNew] })

        await expect(useNoteStore.getState().getAllNotes()).resolves.not.toThrow()
        expect(useNoteStore.getState().notes).toEqual([brandNew])
    })

    test('preserves a note created locally while the request is in flight', async () => {
        let resolveFetch
        getAllNotes.mockImplementationOnce(() => new Promise((resolve) => { resolveFetch = resolve }))

        const call = useNoteStore.getState().getAllNotes()

        // Simulate a note:creation socket event (or local createNote) landing
        // after the snapshot (notesAtStart) was already taken.
        const createdMidFlight = buildNote({ _id: 'new', version: 1, title: 'Created Mid Flight' })
        useNoteStore.setState({ notes: [...useNoteStore.getState().notes, createdMidFlight] })

        // Server snapshot was taken before the create happened, so it doesn't know about it.
        resolveFetch({ data: [buildNote({ _id: 'existing', version: 1 })] })
        await call

        expect(useNoteStore.getState().notes).toEqual(
            expect.arrayContaining([createdMidFlight, buildNote({ _id: 'existing', version: 1 })])
        )
        expect(useNoteStore.getState().notes).toHaveLength(2)
    })

    test('does not resurrect a note deleted locally while the request is in flight', async () => {
        const existing = buildNote({ _id: 'a', version: 1 })
        useNoteStore.setState({ notes: [existing] })

        let resolveFetch
        getAllNotes.mockImplementationOnce(() => new Promise((resolve) => { resolveFetch = resolve }))

        const call = useNoteStore.getState().getAllNotes()

        // Simulate a note:deletion socket event (or local deleteNote) landing
        // after the snapshot was taken but before the response arrives.
        useNoteStore.setState({ notes: [] })

        // Server's snapshot still has the note, since it hasn't processed the delete yet.
        resolveFetch({ data: [existing] })
        await call

        expect(useNoteStore.getState().notes).toEqual([])
    })

    test('keeps a mid-flight local update even though the note was also deleted-then-refetched elsewhere', async () => {
        const original = buildNote({ _id: 'a', version: 1, title: 'Original' })
        useNoteStore.setState({ notes: [original] })

        let resolveFetch
        getAllNotes.mockImplementationOnce(() => new Promise((resolve) => { resolveFetch = resolve }))

        const call = useNoteStore.getState().getAllNotes()

        // A newer version arrives locally (e.g. via note:updation) mid-flight.
        const updatedMidFlight = buildNote({ _id: 'a', version: 2, title: 'Updated Mid Flight' })
        useNoteStore.setState({ notes: [updatedMidFlight] })

        // Server snapshot still reflects the old version.
        resolveFetch({ data: [original] })
        await call

        expect(useNoteStore.getState().notes).toEqual([updatedMidFlight])
    })

    test('handles a create and a delete happening in the same in-flight window', async () => {
        const toDelete = buildNote({ _id: 'del', version: 1 })
        useNoteStore.setState({ notes: [toDelete] })

        let resolveFetch
        getAllNotes.mockImplementationOnce(() => new Promise((resolve) => { resolveFetch = resolve }))

        const call = useNoteStore.getState().getAllNotes()

        const createdMidFlight = buildNote({ _id: 'new', version: 1 })
        useNoteStore.setState({ notes: [createdMidFlight] }) // 'del' removed, 'new' added, mid-flight

        // Server snapshot predates both events: still has 'del', doesn't have 'new'.
        resolveFetch({ data: [toDelete] })
        await call

        expect(useNoteStore.getState().notes).toEqual([createdMidFlight])
    })

    test('sets an error and rethrows when the latest request fails', async () => {
        getAllNotes.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })

        await expect(useNoteStore.getState().getAllNotes()).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Server error')
    })

    test('falls back to a generic error message when retrieval fails without a server message', async () => {
        getAllNotes.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().getAllNotes()).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Notes Retrieval Failed')
    })
})

describe('exportNote', () => {
    test('returns the export response', async () => {
        const response = { headers: {}, data: new Blob(['content']) }
        exportNote.mockResolvedValueOnce(response)

        const result = await useNoteStore.getState().exportNote('a')

        expect(exportNote).toHaveBeenCalledWith('a')
        expect(result).toEqual(response)
    })

    test('sets an error and rethrows when export fails', async () => {
        exportNote.mockRejectedValueOnce({ response: { data: { message: 'Export failed on server' } } })

        await expect(useNoteStore.getState().exportNote('a')).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Export failed on server')
    })

    test('falls back to a generic error message when export fails without a server message', async () => {
        exportNote.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().exportNote('a')).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Note Export Failed')
    })
})

describe('importNote', () => {
    test('adds the imported note to state and returns it', async () => {
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        const created = buildNote({ _id: 'a', title: 'note' })
        importNote.mockResolvedValueOnce({ data: { created_note: created } })

        const result = await useNoteStore.getState().importNote(file)

        expect(importNote).toHaveBeenCalledWith(file)
        expect(result).toEqual(created)
        expect(useNoteStore.getState().notes).toEqual([created])
    })

    test('does not duplicate a note that already exists in state', async () => {
        const existing = buildNote({ _id: 'a' })
        useNoteStore.setState({ notes: [existing] })
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        importNote.mockResolvedValueOnce({ data: { created_note: existing } })

        await useNoteStore.getState().importNote(file)

        expect(useNoteStore.getState().notes).toEqual([existing])
    })

    test('sets an error and rethrows when import fails', async () => {
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        importNote.mockRejectedValueOnce({ response: { data: { message: 'Unsupported file type' } } })

        await expect(useNoteStore.getState().importNote(file)).rejects.toBeTruthy()
        expect(useNoteStore.getState().error).toBe('Unsupported file type')
    })

    test('falls back to a generic error message when import fails without a server message', async () => {
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        importNote.mockRejectedValueOnce(new Error('network down'))

        await expect(useNoteStore.getState().importNote(file)).rejects.toThrow('network down')
        expect(useNoteStore.getState().error).toBe('Note Import Failed')
    })
})

describe('initSocketListeners', () => {
    test('does nothing when there is no socket', () => {
        getSocket.mockReturnValueOnce(null)

        expect(() => useNoteStore.getState().initSocketListeners()).not.toThrow()
    })

    test('registers creation, updation and deletion handlers on the socket', () => {
        const socket = { on: jest.fn(), off: jest.fn() }
        getSocket.mockReturnValue(socket)

        useNoteStore.getState().initSocketListeners()

        expect(socket.off).toHaveBeenCalledWith('note:creation')
        expect(socket.off).toHaveBeenCalledWith('note:updation')
        expect(socket.off).toHaveBeenCalledWith('note:deletion')
        expect(socket.on).toHaveBeenCalledWith('note:creation', expect.any(Function))
        expect(socket.on).toHaveBeenCalledWith('note:updation', expect.any(Function))
        expect(socket.on).toHaveBeenCalledWith('note:deletion', expect.any(Function))
    })

    test('adds a note received over the socket when it is not already present', () => {
        const handlers = {}
        const socket = {
            on: jest.fn((event, handler) => { handlers[event] = handler }),
            off: jest.fn()
        }
        getSocket.mockReturnValue(socket)
        useNoteStore.getState().initSocketListeners()

        const created = buildNote({ _id: 'a' })
        handlers['note:creation'](created)

        expect(useNoteStore.getState().notes).toEqual([created])
    })

    test('ignores a socket creation event for a note that already exists', () => {
        const handlers = {}
        const socket = {
            on: jest.fn((event, handler) => { handlers[event] = handler }),
            off: jest.fn()
        }
        getSocket.mockReturnValue(socket)
        const existing = buildNote({ _id: 'a' })
        useNoteStore.setState({ notes: [existing] })
        useNoteStore.getState().initSocketListeners()

        handlers['note:creation'](existing)

        expect(useNoteStore.getState().notes).toEqual([existing])
    })

    test('applies a socket update only when its version is newer', () => {
        const handlers = {}
        const socket = {
            on: jest.fn((event, handler) => { handlers[event] = handler }),
            off: jest.fn()
        }
        getSocket.mockReturnValue(socket)
        const existing = buildNote({ _id: 'a', version: 1, title: 'First Note' })
        useNoteStore.setState({ notes: [existing] })
        useNoteStore.getState().initSocketListeners()

        const staleUpdate = buildNote({ _id: 'a', version: 1, title: 'Stale Title' })
        handlers['note:updation'](staleUpdate)
        expect(useNoteStore.getState().notes[0].title).toBe('First Note')

        const newerUpdate = buildNote({ _id: 'a', version: 2, title: 'Newer Title' })
        handlers['note:updation'](newerUpdate)
        expect(useNoteStore.getState().notes[0].title).toBe('Newer Title')
    })

    test('removes a note when a socket deletion event is received', () => {
        const handlers = {}
        const socket = {
            on: jest.fn((event, handler) => { handlers[event] = handler }),
            off: jest.fn()
        }
        getSocket.mockReturnValue(socket)
        const existing = buildNote({ _id: 'a' })
        useNoteStore.setState({ notes: [existing] })
        useNoteStore.getState().initSocketListeners()

        handlers['note:deletion']('a')

        expect(useNoteStore.getState().notes).toEqual([])
    })
})

describe('cleanSocketListeners', () => {
    test('does nothing when there is no socket', () => {
        getSocket.mockReturnValueOnce(null)

        expect(() => useNoteStore.getState().cleanSocketListeners()).not.toThrow()
    })

    test('removes creation, updation and deletion handlers from the socket', () => {
        const socket = { on: jest.fn(), off: jest.fn() }
        getSocket.mockReturnValue(socket)

        useNoteStore.getState().cleanSocketListeners()

        expect(socket.off).toHaveBeenCalledWith('note:creation')
        expect(socket.off).toHaveBeenCalledWith('note:updation')
        expect(socket.off).toHaveBeenCalledWith('note:deletion')
    })
})