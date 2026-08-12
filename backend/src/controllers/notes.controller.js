import notesModel from "../models/notes.model.js"

export const createNoteController = async (req,res,next) =>
{
    try
    {
        console.log('note creation endpoint reached')
        
        /* since the middleware already appends user id to req object we use it directly */
        const notes_instance = await notesModel.create({user_id:req.user.id,...req.body,})
        console.log('Note Added: ')
        console.log(notes_instance)

        return res.json({'Message' : 'Note Creation Controller Working'})
    }
    catch(err) 
    {
        next(err)
    }
}

export const updateNoteController = async (req,res,next) =>
{
    try
    {
        console.log('note updation endpoint reached')
        const note_id = req.params.id
        const updated_note = await notesModel.findOneAndUpdate(
            {_id: note_id, user_id: req.user.id},
            req.body,
            {new: true, runValidation: true}
        )
        console.log('Updated Note: ')
        console.log(updated_note)
        
        return res.json({'Message' : 'Note Updation Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const deleteNoteController = async (req,res,next) =>
{
    try
    {
        console.log('note deletion endpoint reached')

        const result = await notesModel.deleteOne({_id: req.params.id})
    
        if (result.deletedCount)
            console.log('Deletion Successful')
        else
        {
            console.log('Record Not Found')
            const err = new Error('Record Not Found')
            err.statusCode = 404
            throw err
        }
        
        return res.json({'Message' : 'Note Deletion Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const getNoteController = async (req,res,next) => 
{
    try
    {
        console.log('note read endpoint reached')
        const note_instance = await notesModel.findOne({_id:req.params.id,user_id:req.user.id})
        
        if (!note_instance)
        {
            console.log('Note Not Found')
            const err = new Error('Note Not Found')
            err.statusCode = 404
            throw err
        }
        
        return res.json(note_instance)
    }
    catch(err)
    {
        next(err)
    }
}
export const getAllNotesController = async (req,res,next) => 
{
    try
    {
        console.log('note read endpoint reached')
        const notes = await notesModel.find({user_id:req.user.id})
        
        if (!notes.length)
        {
            console.log('Notes Not Found')
            const err = new Error('Notes Not Found')
            err.statusCode = 404
            throw err
        }
        
        return res.json(notes)
    }
    catch(err)
    {
        next(err)
    }
}