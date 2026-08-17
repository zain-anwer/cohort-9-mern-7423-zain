import notesModel from "../models/notes.model.js"

const createNoteService = async (note_object) =>
{  
    const note = await notesModel.create(note_object)
    console.log('Note Added')
    return note
}

const updateNoteService = async (note_id,user_id,note_object) => {
    
    const updated_note = await notesModel.findOneAndUpdate(
        
        {_id: note_id, user_id: user_id},
        note_object,
        
        /* new: true ensures that the updated record/document is returned */
        /* runValidators: true ensures that schema validation is run on updated document */
        {new: true, runValidators: true}
    )

    if (updated_note)
        console.log('Updation Successful')
    else
    {
        const err = new Error('Note Not Found')
        err.statusCode = 404
        throw err
    }

    console.log('Note Updated')
    return updated_note
}

const deleteNoteService = async (note_id,user_id) => {
    
    /* using findOneAndDelete instead of deleteOne so that deleted note could be sent for undo */
    const deleted_note = await notesModel.findOneAndDelete({_id: note_id, user_id: user_id})

    if (deleted_note)
    {
        console.log('Deletion Successful')
        return deleted_note
    }
    
    console.log('Record Not Found')
    const err = new Error('Record Not Found')
    err.statusCode = 404
    throw err
}

const getNoteService = async (note_id,user_id) => {
    
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

export default {
    createNoteService,
    updateNoteService,
    deleteNoteService,
    getNoteService,
    getAllNotesService
}