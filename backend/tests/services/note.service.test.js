import noteService from '../../src/services/notes.service.js'
import notesModel from '../../src/models/notes.model.js'
import sinon from 'sinon'
import {expect} from 'chai'

describe('Note Creation Service', () => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should create a note successfully, returning the created note with no errors', async () => {

        /* mocking request note object and created note */

        const note_requested = {
            'user_id': '114c2f27fcd86ed799431012',
            'title': 'Kale Salad',
            'content': 'Not worth it'
        }

        const note_created = {
            _id: '507f1f77bcf86cd799439011',
            ...note_requested,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        /* stubbing database call */
        sinon.stub(notesModel,'create').resolves(note_created)

        const result = await noteService.createNoteService(note_requested)

        /* assertions */
        expect(result).to.equal(note_created)
    })
})

describe('Note Updation Service', () => { 
    
    afterEach(() => { 
        sinon.restore()
    })

    it('should successfully update and return the updated note', async() => {

        /* mocking note details */
        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : 'Kale Salad',
            'content': 'Do not recommend'
        }

        /* mocking returned updated note object */
        const updated_note = {
            _id: note_id,
            user_id: user_id,
            ...note_object,
            createdAt: new Date(),
            updatedAt: new Date()
        } 

        /* stubbing db call */
        sinon.stub(notesModel,'findOneAndUpdate').resolves(updated_note)

        const result = await noteService.updateNoteService(note_id,user_id,note_object)

        /* assertions */
        expect(result).to.equal(updated_note)
    })

    it('should return appropriate error message and status code if note does not exist', async() => {

        /* mocking note details */
        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : 'Kale Salad',
            'content': 'Do not recommend'
        }

        /* stubbing db call */
        sinon.stub(notesModel,'findOneAndUpdate').resolves(null)

        /* error variable */
        var thrownError = null

        try {
            await noteService.updateNoteService(note_id,user_id,note_object)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
    })
})

describe('Note Deletion Service', () => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully delete and return the deleted note', async() => {

        /* mocking note details */
        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
       
        /* mocking returned updated note object */
        const deleted_note = {
            _id: note_id,
            user_id: user_id,
            title : 'Kale Salad',
            content: 'Do not recommend',
            createdAt: new Date(),
            updatedAt: new Date()
        } 

        /* stubbing db call */
        sinon.stub(notesModel,'findOneAndDelete').resolves(deleted_note)

        const result = await noteService.deleteNoteService(note_id,user_id)

        /* assertions */
        expect(result).to.equal(deleted_note)
    })

    it('should return appropriate error message and status code if note does not exist', async() => {

        /* mocking note details */
        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'

        /* stubbing db call */
        sinon.stub(notesModel,'findOneAndDelete').resolves(null)

        /* error variable */
        var thrownError = null

        try {
            await noteService.deleteNoteService(note_id,user_id)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Record Not Found')
    })
})

describe('Note Retrieval Service', () => {
    afterEach(() => {
        sinon.restore()
    })

    it('should retrieve the requested note successfully', async () => {
        /* mocking note id and user id */
        const note_id = '65c2a1f4e3b0c44298fc1c14'
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        /* mocking note object */
        const retrieved_note = {
            _id: note_id,
            user_id: user_id,
            title : 'Kale Salad',
            content: 'Do not recommend',
            createdAt: new Date(),
            updatedAt: new Date()
        } 

        /* stubbing database call */
        sinon.stub(notesModel,'findOne').resolves(retrieved_note)
        
        const result = await noteService.getNoteService(note_id,user_id)
        
        /* assertion */
        expect(result).to.equal(retrieved_note)
    })

    it('should throw error with appropriate message and status code if note is not found', async () => {
        /* mocking note id and user id */
        const note_id = '65c2a1f4e3b0c44298fc1c14'
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        /* stubbing database call */
        sinon.stub(notesModel,'findOne').resolves(null)
        
        /* error variable */
        var thrownError = null 

        try {
            await noteService.getNoteService(note_id,user_id)
        }
        catch(err)
        {
            thrownError = err
        }

        /* assertion */
        expect(thrownError).to.not.equal(null)
        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
    })
})

describe('All Notes Retrieval Service', () => {
    it('should return notes array successfully', async () => {
        /* mocking user id */
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        /* mock notes array */
        const notes_array = [{
            _id: '12f2a1c4e3b0d44298ac1c01',
            user_id: user_id,
            title : 'Kale Salad',
            content: 'Do not recommend',
            createdAt: new Date(),
            updatedAt: new Date()
        }]
        
        /* stub database call */
        sinon.stub(notesModel,'find').resolves(notes_array)
        
        const result = await noteService.getAllNotesService(user_id)

        /* assertions */
        expect(result).to.be.an('array')
        expect(result).to.equal(notes_array)
    })
})