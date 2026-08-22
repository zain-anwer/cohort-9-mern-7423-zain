import noteService from "../services/notes.service.js"

export const createNoteController = async (req,res,next) =>
{
    try
    { 
        req.log.info('creating note') 

        /* extracting title and content only so user can't provide user_id to overwrite ownership */
        let {title,content} = req.body ?? {} 

        if (!title && !content)
        {
            const err = new Error('No Values Given')
            err.statusCode = 400
            throw err
        }
        else if (!title) {
            title = 'Untitled'
        }
        
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
        req.log.info({ noteId: req.params.id }, 'updating note')
 
        /* extracting only title and content here as well so that user_id can't be overridden */
        const {title,content,is_pinned,is_binned,is_archived,version} = req.body ?? {}

        if (title === undefined && content === undefined && is_pinned === undefined
            && is_binned === undefined && is_archived === undefined) 
        {
            const err = new Error('No Updated Values Given')
            err.statusCode = 400
            throw err
        }

        const updated_note = await noteService.updateNoteService(req.params.id,req.user.id,{title,content,is_pinned,is_binned,is_archived,version})
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
        req.log.info({ noteId: req.params.id }, 'deleting note')
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
        req.log.info({ noteId: req.params.id }, 'fetching note')
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
        req.log.info('fetching notes')
        const notes = await noteService.getAllNotesService(req.user.id)
        return res.status(200).json(notes)
    }
    catch(err)
    {
        next(err)
    }
}

export const exportNoteController = async (req,res,next) => {
    try {
        req.log.info({ noteId: req.params.id }, 'exporting note')
        const note = await noteService.exportNoteService(req.params.id,req.user.id)
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader(
            `Content-Disposition`,
            `attachment; filename="${note.title}.txt"`
        )
        res.status(200).send(note.content)
    
    }
    catch(err) {
        next(err)
    }
}

export const importNoteController = async (req,res,next) => {
    try {
        if (!req.file) {
            const err = new Error('No File Provided')
            err.statusCode = 400
            throw err
        }

        const title = req.file.originalname.replace(/\.txt$/i, '')
        const content = req.file.buffer.toString('utf-8')
        const note = await noteService.createNoteService(
            {
                user_id: req.user.id,
                title: title,
                content: content
            }
        )
        return res.status(201).json({
            'Message' : 'Note Imported Successfully',
            'created_note': note 
        })
    }
    catch(err) {
        next(err)
    }
}