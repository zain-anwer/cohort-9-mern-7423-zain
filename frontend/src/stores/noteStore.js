import { create } from 'zustand'
import { createNote, deleteNote, updateNote, getNote, getAllNotes, exportNote, importNote } from '../services/noteService.js'
import { getSocket } from '../utils/socket.js'

let latestRequestId = 0

const useNoteStore = create((set,get) => ({
    
    notes: [],
    error: null,
    
    initSocketListeners: () => {
        let socket = getSocket()
        if (!socket)
            return
        socket.off('note:creation')
        socket.off('note:updation')
        socket.off('note:deletion')

        socket.on('note:creation',(created_note) => { 
            const exists = get().notes.some((note) => note._id === created_note._id)
            if (!exists)
                set({notes:[...get().notes,created_note]})
        })

        socket.on('note:updation',(updated_note) => {
            const existing_note = get().notes.find((note) => note._id === updated_note._id)
            if (!existing_note) {
                set({notes: [...get().notes, updated_note]})
                return
            }
            if (updated_note.version > existing_note.version)
                set({notes: get().notes.map((note) => (note._id === updated_note._id) ? updated_note : note)})
        })

        socket.on('note:deletion',(deleted_note_id) => {
            set({notes: get().notes.filter((note) => note._id != deleted_note_id)})
        })
    },

    cleanSocketListeners: () => {
        let socket = getSocket()
        if (!socket) 
            return

        socket.off('note:creation')
        socket.off('note:updation')
        socket.off('note:deletion')
    },

    createNote: async(note) => {

        set({error: null})

        try {
            const res = await createNote(note)
            const exists = get().notes.some((note) => note._id === res.data.created_note._id)
            if (!exists)
                set({notes: [...get().notes,res.data.created_note]})
            return res.data.created_note
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Note Creation Failed'})
            throw err
        }
    },
    
    updateNote: async(note_id,updated_note) => {
        
        set({error: null})
        
        try {
            const res = await updateNote(note_id,updated_note) 
            set({notes: get().notes.map((note) => (note._id === note_id) ? res.data.updated_note : note)})
            return res.data.updated_note
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Note Updation Failed'})
            throw err
        }
    },

    deleteNote: async(note_id) => {

        set({error: null})

        try {
            await deleteNote(note_id)
            set({notes: get().notes.filter((note) => note._id !== note_id)})
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Note Deletion Failed'})
            throw err
        }
    },

    getNote: async(note_id) => {
        
        set({error: null})
        
        try{
            const res = await getNote(note_id)
            return res.data
        }
        catch(err)
        {
            set({error: err.response?.data?.message || 'Note Retrieval Failed'})
            throw err
        }
    },

    getAllNotes: async() => {
        
        const requestId = ++latestRequestId
        set({error: null})

        try{
            const res = await getAllNotes()
            if (requestId === latestRequestId) {
                const merged_array = res.data.map((note) => {
                    const existing_note = get().notes.find((n) => note._id === n._id)
                    if (existing_note && existing_note.version > note.version)
                        return existing_note
                    else
                        return note
                })
                set({notes: merged_array})
            }
        }
        catch(err)
        { 
            if (requestId === latestRequestId) {
                set({error: err.response?.data?.message || 'Notes Retrieval Failed'})
                throw err
            }
        }
    },

    exportNote: async(note_id) => {

        set({error: null})

        try {
            const res = await exportNote(note_id)
            return res
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Note Export Failed'})
            throw err
        }
    },

    importNote: async(file) => {

        set({error: null})

        try {
            const res = await importNote(file)
            const exists = get().notes.some((note) => note._id === res.data.created_note._id)
            if (!exists)
                set({notes: [...get().notes,res.data.created_note]})
            return res.data.created_note
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Note Import Failed'})
            throw err
        }
    }
}))

export default useNoteStore