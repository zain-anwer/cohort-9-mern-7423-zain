import notesModel from "../models/notes.model.js"

export const createNoteService = async (note_object) =>
{  
    const note = await notesModel.create(note_object)
    console.log('Note Added: ')
    console.log(note)
    return note
}

export const updateNoteService = async (note_id,user_id,note_object) => {
    
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

    console.log('Updated Note: ')
    console.log(updated_note)
    return updated_note
}

export const deleteNoteService = async (note_id,user_id) => {
    
    const result = await notesModel.deleteOne({_id: note_id, user_id: user_id})

    if (result.deletedCount)
        console.log('Deletion Successful')
    else
    {
        console.log('Record Not Found')
        const err = new Error('Record Not Found')
        err.statusCode = 404
        throw err
    }
}

export const getNoteService = async (note_id,user_id) => {
    
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

export const getAllNotesService = async (user_id) => {
    
    const notes = await notesModel.find({user_id:user_id})  

    return notes
}