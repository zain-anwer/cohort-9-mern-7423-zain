import { create } from 'zustand'
import { createNote, deleteNote, updateNote, getNote, getAllNotes } from '../services/noteService.js'

const useNoteStore = create((set,get) => ({
    
    notes: [],
    error: null,
    
    addNote: async(note) => {

        set({error: null})

        try {
            const res = await createNote(note)
            set({notes: [...get().notes,res.data.created_note]})
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
            set({notes: get().notes.map((note) => (note.id === note_id) ? res.data.updated_note : note)})
        }
        catch(err) {
            set({error: err.response?.data?.message || 'Note Updation Failed'})
            throw err
        }
    },

    removeNote: async(note_id) => {

        set({error: null})

        try {
            await deleteNote(note_id)
            set({notes: get().notes.filter((note) => note.id !== note_id)})
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
        
        set({error: null})

        try{
            const res = await getAllNotes()
            set({notes: res.data})
        }
        catch(err)
        {
            set({error: err.response?.data?.message || 'Notes Retrieval Failed'})
            throw err
        }
    }
}))