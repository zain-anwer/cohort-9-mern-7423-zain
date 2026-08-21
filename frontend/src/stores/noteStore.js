import { create } from 'zustand'
import { createNote, deleteNote, updateNote, getNote, getAllNotes } from '../services/noteService.js'

let latestRequestId = 0

const useNoteStore = create((set,get) => ({
    
    notes: [],
    error: null,
    
    createNote: async(note) => {

        set({error: null})

        try {
            const res = await createNote(note)
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
               
                set({notes: res.data})
            }
        }
        catch(err)
        { 
            if (requestId === latestRequestId) {
                set({error: err.response?.data?.message || 'Notes Retrieval Failed'})
                throw err
            }
        }
    }
}))

export default useNoteStore