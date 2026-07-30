export const createNoteController = (req,res,next) =>
{
    try
    {
        console.log('note creation endpoint reached')
        return res.json({'Message' : 'Note Creation Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const updateNoteController = (req,res,next) =>
{
    try
    {
        console.log('note updation endpoint reached')
        return res.json({'Message' : 'Note Updation Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const deleteNoteController = (req,res,next) =>
{
    try
    {
        console.log('note deletion endpoint reached')
        return res.json({'Message' : 'Note Deletion Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const getNoteController = (req,res,next) => 
{
    try
    {
        console.log('note read endpoint reached')
        return res.json({'Message' : 'Read Note Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}

export const getAllNotesController = (req,res,next) => 
{
    try
    {
        console.log('note read endpoint reached')
        return res.json({'Message' : 'Read All Notes Controller Working'})
    }
    catch(err)
    {
        next(err)
    }
}