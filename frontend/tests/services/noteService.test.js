import {    createNote, updateNote, deleteNote, getNote, 
    getAllNotes, exportNote, importNote
} from '../../src/services/noteService.js'
import axiosInstance from '../../src/utils/axios'

jest.mock('../../src/utils/axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        get: jest.fn()
    }
}))

beforeEach(() => {
    jest.clearAllMocks()
})

describe('createNote', () => {
    test('posts to /notes/ with the note payload', async () => {
        const note = { title: 'Untitled', content: '' }
        axiosInstance.post.mockResolvedValueOnce({ data: { _id: '1', ...note } })

        const res = await createNote(note)

        expect(axiosInstance.post).toHaveBeenCalledWith('/notes/', note)
        expect(res).toEqual({ data: { _id: '1', ...note } })
    })

    test('propagates an error when creation fails', async () => {
        axiosInstance.post.mockRejectedValueOnce(new Error('create failed'))

        await expect(createNote({ title: 'Untitled', content: '' })).rejects.toThrow('create failed')
    })
})

describe('updateNote', () => {
    test('puts to /notes/:id with the note payload', async () => {
        const note = { title: 'Updated Title' }
        axiosInstance.put.mockResolvedValueOnce({ data: { _id: 'a', ...note } })

        const res = await updateNote('a', note)

        expect(axiosInstance.put).toHaveBeenCalledWith('/notes/a', note)
        expect(res).toEqual({ data: { _id: 'a', ...note } })
    })

    test('propagates an error when update fails', async () => {
        axiosInstance.put.mockRejectedValueOnce(new Error('update failed'))

        await expect(updateNote('a', { title: 'x' })).rejects.toThrow('update failed')
    })
})

describe('deleteNote', () => {
    test('deletes /notes/:id', async () => {
        axiosInstance.delete.mockResolvedValueOnce({ data: { message: 'deleted' } })

        const res = await deleteNote('a')

        expect(axiosInstance.delete).toHaveBeenCalledWith('/notes/a')
        expect(res).toEqual({ data: { message: 'deleted' } })
    })

    test('propagates an error when deletion fails', async () => {
        axiosInstance.delete.mockRejectedValueOnce(new Error('delete failed'))

        await expect(deleteNote('a')).rejects.toThrow('delete failed')
    })
})

describe('getNote', () => {
    test('gets /notes/:id', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: { _id: 'a', title: 'First Note' } })

        const res = await getNote('a')

        expect(axiosInstance.get).toHaveBeenCalledWith('/notes/a')
        expect(res).toEqual({ data: { _id: 'a', title: 'First Note' } })
    })

    test('propagates an error when fetching a single note fails', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('fetch failed'))

        await expect(getNote('a')).rejects.toThrow('fetch failed')
    })
})

describe('getAllNotes', () => {
    test('gets /notes/', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: [{ _id: 'a' }, { _id: 'b' }] })

        const res = await getAllNotes()

        expect(axiosInstance.get).toHaveBeenCalledWith('/notes/')
        expect(res).toEqual({ data: [{ _id: 'a' }, { _id: 'b' }] })
    })

    test('propagates an error when fetching all notes fails', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('fetch failed'))

        await expect(getAllNotes()).rejects.toThrow('fetch failed')
    })
})

describe('exportNote', () => {
    test('gets /notes/export/:id with a blob response type', async () => {
        const blob = new Blob(['note content'])
        axiosInstance.get.mockResolvedValueOnce({ headers: {}, data: blob })

        const res = await exportNote('a')

        expect(axiosInstance.get).toHaveBeenCalledWith('/notes/export/a', { responseType: 'blob' })
        expect(res).toEqual({ headers: {}, data: blob })
    })

    test('propagates an error when export fails', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('export failed'))

        await expect(exportNote('a')).rejects.toThrow('export failed')
    })
})

describe('importNote', () => {
    test('posts a FormData payload containing the file to /notes/import', async () => {
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        axiosInstance.post.mockResolvedValueOnce({ data: { message: 'imported' } })

        const res = await importNote(file)

        expect(axiosInstance.post).toHaveBeenCalledWith('/notes/import', expect.any(FormData))
        const formData = axiosInstance.post.mock.calls[0][1]
        expect(formData.get('file')).toBe(file)
        expect(res).toEqual({ data: { message: 'imported' } })
    })

    test('propagates an error when import fails', async () => {
        const file = new File(['note content'], 'note.txt', { type: 'text/plain' })
        axiosInstance.post.mockRejectedValueOnce(new Error('import failed'))

        await expect(importNote(file)).rejects.toThrow('import failed')
    })
})