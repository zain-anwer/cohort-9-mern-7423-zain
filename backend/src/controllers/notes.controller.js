import noteService from "../services/notes.service.js"

export const createNoteController = async (req,res,next) =>
{
    try
    { 
        console.log('note creation endpoint reached') 

        /* extracting title and content only so user can't provide user_id to overwrite ownership */
        const {title,content} = req.body ?? {} 
        
        /* since the middleware already appends user id to req object we use it directly */
        const note = await noteService.createNoteService(
            {
                user_id: req.user.id,
                title: title,
                content: content
            }
        )
        return res.status(201).json({
            'Message' : 'Note Created Successfully',
            'created_note': note 
        })
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
 
        /* extracting only title and content here as well so that user_id can't be overridden */
        const {title,content} = req.body ?? {}

        const updated_note = await noteService.updateNoteService(req.params.id,req.user.id,{title,content})
        return res.status(200).json({
            'Message' : 'Note Updated Successfully',
            'updated_note' : updated_note
        })
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
        const deleted_note = await noteService.deleteNoteService(req.params.id,req.user.id)
        return res.status(200).json(
            {
                'Message' : 'Note Deleted Successfully',
                'deleted_note' : deleted_note
            }
        )
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
        const note = await noteService.getNoteService(req.params.id,req.user.id)
        return res.status(200).json(note)
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
        const notes = await noteService.getAllNotesService(req.user.id)
        return res.status(200).json(notes)
    }
    catch(err)
    {
        next(err)
    }
}