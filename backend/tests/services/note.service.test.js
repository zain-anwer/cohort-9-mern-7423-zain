// import {createNoteService, deleteNoteService,
//         getNoteService, getAllNotesService, 
//         updateNoteService
// } from "../services/notes.service.js"

// export const createNoteController = async (req,res,next) =>
// {
//     try
//     {
//         console.log('note creation endpoint reached') 

//         /* since the middleware already appends user id to req object we use it directly */
//         const note = await createNoteService({user_id: req.user.id,...req.body})

//         return res.status(201).json({
//             'Message' : 'Note Created Successfully',
//             'created_note': note 
//         })
//     }
//     catch(err) 
//     {
//         next(err)
//     }
// }

// export const updateNoteController = async (req,res,next) =>
// {
//     try
//     {
//         console.log('note updation endpoint reached')
      
//         /* invoking service */
//         const updated_note = await updateNoteService(req.params.id,req.user.id,req.body)
        
//         return res.status(200).json({
//             'Message' : 'Note Updation Controller Working',
//             'updated_note' : updated_note
//         })
//     }
//     catch(err)
//     {
//         next(err)
//     }
// }

// export const deleteNoteController = async (req,res,next) =>
// {
//     try
//     {
//         console.log('note deletion endpoint reached')

//         await deleteNoteService(req.params.id,req.user.id)
        
//         return res.status(200).json({'Message' : 'Note Deletion Controller Working'})
//     }
//     catch(err)
//     {
//         next(err)
//     }
// }

// export const getNoteController = async (req,res,next) => 
// {
//     try
//     {
//         console.log('note read endpoint reached')
    
//         /* invoking service */
//         const note = await getNoteService(req.params.id,req.user.id)
        
//         return res.status(200).json(note)
//     }
//     catch(err)
//     {
//         next(err)
//     }
// }

// export const getAllNotesController = async (req,res,next) => 
// {
//     try
//     {
//         console.log('note read endpoint reached')
     
//         /* invoking service */
//         const notes = await getAllNotesService(req.user.id)

//         return res.status(200).json(notes)
//     }
//     catch(err)
//     {
//         next(err)
//     }
// }