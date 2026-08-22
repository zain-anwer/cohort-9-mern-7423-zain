import notesModel from "../models/notes.model.js"
import { noteEvent } from "../events/note.event.js"
import mongoose from "mongoose"
import { convert } from "html-to-text"

const stripHtml = (html = '') => {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }               
    ]
  });
}

const assertValidId = (note_id) => {
    if (!mongoose.Types.ObjectId.isValid(note_id))
    {
        const err = new Error('Note Not Found')
        err.statusCode = 404
        throw err
    }
}

const normalizeMongoWriteError = (err) => {
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        const normalized = new Error(messages.join(', '))
        normalized.statusCode = 400
        return normalized
    }
    if (err.code === 11000) {
        const normalized = new Error('A note with this value already exists')
        normalized.statusCode = 409
        return normalized
    }
    return err
}

const createNoteService = async (note_object) =>
{  
    let note
    try {
        note = await notesModel.create(note_object)
    } catch (err) {
        throw normalizeMongoWriteError(err)
    }
    noteEvent.emit('create:note',{user_id:note.user_id,created_note:note})
    return note
}

const updateNoteService = async (note_id,user_id,note_object) => {
    
    assertValidId(note_id)

    const existing_note = await notesModel.findOne({_id: note_id,user_id: user_id})

    if (!existing_note) {
        const err = new Error('Note Not Found')
        err.statusCode = 404
        throw err
    }

    if (note_object.is_pinned === true && existing_note.is_pinned === false) 
        existing_note.pinned_at = new Date()
    else if (note_object.is_pinned === false)
        existing_note.pinned_at = null
    
    if (note_object.is_binned === true && existing_note.is_binned === false)
        existing_note.binned_at = new Date()
    else if (note_object.is_binned === false)
        existing_note.binned_at = null
    
    if (note_object.is_archived === true && existing_note.is_archived === false)
        existing_note.archived_at = new Date()
    else if (note_object.is_archived === false)
        existing_note.archived_at = null

    note_object = {...note_object,
                    pinned_at: existing_note.pinned_at,
                    binned_at: existing_note.binned_at,
                    archived_at: existing_note.archived_at
    }

    const version = note_object.version
    delete note_object.version
    let updated_note
    try {
        updated_note = await notesModel.findOneAndUpdate(
            {_id: note_id, user_id: user_id, version: version},
            {...note_object, $inc:{version:1}},
            
            /* new: true ensures that the updated record/document is returned */
            /* runValidators: true ensures that schema validation is run on updated document */
            {new: true, runValidators: true}
        )
    } catch (err) {
        throw normalizeMongoWriteError(err)
    }

    if (updated_note)
        console.log('Updation Successful')
    else
    {
        const err = new Error('Someone changed this note - Please refresh')
        err.statusCode = 409
        throw err
    }

    noteEvent.emit('update:note',{user_id:user_id,updated_note:updated_note})
    return updated_note
}

const deleteNoteService = async (note_id,user_id) => {
    
    assertValidId(note_id)

    /* using findOneAndDelete instead of deleteOne so that deleted note could be sent for undo */
    const deleted_note = await notesModel.findOneAndDelete({_id: note_id, user_id: user_id})

    if (deleted_note)
    {
        console.log('Deletion Successful')
        noteEvent.emit('delete:note',{user_id:user_id,note_id:note_id})
        return deleted_note
    }
    
    console.log('Record Not Found')
    const err = new Error('Record Not Found')
    err.statusCode = 404
    throw err
}

const getNoteService = async (note_id,user_id) => {
    
    assertValidId(note_id)
    
    const note = await notesModel.findOne({_id:note_id,user_id:user_id})
        
    if (!note)
    {
        console.log('Note Not Found')
        const err = new Error('Note Not Found')
        err.statusCode = 404
        throw err
    }
    
    return note
}

const getAllNotesService = async (user_id) => {
    
    const notes = await notesModel.find({user_id:user_id})  

    return notes
}

const exportNoteService = async (note_id,user_id) => {

    assertValidId(note_id)
    const note = await notesModel.findOne({_id:note_id,user_id:user_id})
    
    if (!note) {
        const error = new Error('No Note Found')
        error.statusCode = 404
        throw error
    }
    
    return {title:note.title,content:stripHtml(note.content)}
}

export default {
    createNoteService,
    updateNoteService,
    deleteNoteService,
    getNoteService,
    getAllNotesService,
    exportNoteService
}