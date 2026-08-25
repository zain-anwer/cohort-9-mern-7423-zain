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

    it('should throw a normalized 400 error when creation fails validation', async () => {

        const note_requested = {
            'user_id': '114c2f27fcd86ed799431012',
            'title': '',
            'content': 'Not worth it'
        }

        const validationError = new Error('Validation failed')
        validationError.name = 'ValidationError'
        validationError.errors = {
            title: { message: 'Title is required' }
        }

        sinon.stub(notesModel,'create').rejects(validationError)

        var thrownError = null

        try {
            await noteService.createNoteService(note_requested)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(400)
        expect(thrownError.message).to.equal('Title is required')
    })

    it('should throw a normalized 409 error when creation violates a duplicate key constraint', async () => {

        const note_requested = {
            'user_id': '114c2f27fcd86ed799431012',
            'title': 'Kale Salad',
            'content': 'Not worth it'
        }

        const duplicateError = new Error('E11000 duplicate key error')
        duplicateError.code = 11000

        sinon.stub(notesModel,'create').rejects(duplicateError)

        var thrownError = null

        try {
            await noteService.createNoteService(note_requested)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(409)
        expect(thrownError.message).to.equal('A note with this value already exists')
    })
})

describe('Note Updation Service', () => { 
    
    afterEach(() => { 
        sinon.restore()
    })

    it('should successfully update and return the updated note', async() => {

        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : 'Kale Salad',
            'content': 'Do not recommend',
            'version': 1
        }

        const existing_note = {
            _id: note_id,
            user_id: user_id,
            is_pinned: false,
            is_binned: false,
            is_archived: false,
            pinned_at: null,
            binned_at: null,
            archived_at: null
        }

        const updated_note = {
            _id: note_id,
            user_id: user_id,
            title: note_object.title,
            content: note_object.content,
            version: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        } 

        sinon.stub(notesModel,'findOne').resolves(existing_note)
        sinon.stub(notesModel,'findOneAndUpdate').resolves(updated_note)

        const result = await noteService.updateNoteService(note_id,user_id,note_object)

        expect(result).to.equal(updated_note)
        expect(notesModel.findOneAndUpdate.firstCall.args[0]).to.deep.equal({_id:note_id,user_id:user_id,version:1})
        expect(notesModel.findOneAndUpdate.firstCall.args[1]).to.deep.equal({
            title: note_object.title,
            content: note_object.content,
            pinned_at: null,
            binned_at: null,
            archived_at: null,
            $inc: {version:1}
        })
        expect(notesModel.findOneAndUpdate.firstCall.args[2]).to.deep.equal({new:true,runValidators:true})
    })

    it('should return appropriate error message and status code if note does not exist', async() => {

        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : 'Kale Salad',
            'content': 'Do not recommend',
            'version': 1
        }

        sinon.stub(notesModel,'findOne').resolves(null)
        const update_call_stub = sinon.stub(notesModel,'findOneAndUpdate')

        var thrownError = null

        try {
            await noteService.updateNoteService(note_id,user_id,note_object)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
        expect(update_call_stub.called).to.be.false
    })

    it('should return appropriate error message and status code if note id is invalid', async() => {

        const note_id = 'invalid-id'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : 'Kale Salad',
            'content': 'Do not recommend',
            'version': 1
        }

        const find_one_stub = sinon.stub(notesModel,'findOne')
        const db_call_stub = sinon.stub(notesModel,'findOneAndUpdate')

        var thrownError = null

        try {
            await noteService.updateNoteService(note_id,user_id,note_object)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
        expect(find_one_stub.called).to.be.false
        expect(db_call_stub.called).to.be.false
    })

    it('should return 409 if the note was changed elsewhere before the update could be applied', async() => {

        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : 'Kale Salad',
            'content': 'Do not recommend',
            'version': 1
        }

        const existing_note = {
            _id: note_id,
            user_id: user_id,
            is_pinned: false,
            is_binned: false,
            is_archived: false,
            pinned_at: null,
            binned_at: null,
            archived_at: null
        }

        sinon.stub(notesModel,'findOne').resolves(existing_note)
        sinon.stub(notesModel,'findOneAndUpdate').resolves(null)

        var thrownError = null

        try {
            await noteService.updateNoteService(note_id,user_id,note_object)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(409)
        expect(thrownError.message).to.equal('Someone changed this note - Please refresh')
    })

    it('should throw a normalized 400 error when the update fails validation', async() => {

        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'title' : '',
            'content': 'Do not recommend',
            'version': 1
        }

        const existing_note = {
            _id: note_id,
            user_id: user_id,
            is_pinned: false,
            is_binned: false,
            is_archived: false,
            pinned_at: null,
            binned_at: null,
            archived_at: null
        }

        const validationError = new Error('Validation failed')
        validationError.name = 'ValidationError'
        validationError.errors = {
            title: { message: 'Title is required' }
        }

        sinon.stub(notesModel,'findOne').resolves(existing_note)
        sinon.stub(notesModel,'findOneAndUpdate').rejects(validationError)

        var thrownError = null

        try {
            await noteService.updateNoteService(note_id,user_id,note_object)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(400)
        expect(thrownError.message).to.equal('Title is required')
    })

    it('should set pinned_at when a note transitions from unpinned to pinned', async() => {

        const note_id = '507f1f77bcf86cd799439011'
        const user_id = '102f1f77bcf86bd799439042'
        const note_object = {
            'is_pinned': true,
            'version': 1
        }

        const existing_note = {
            _id: note_id,
            user_id: user_id,
            is_pinned: false,
            is_binned: false,
            is_archived: false,
            pinned_at: null,
            binned_at: null,
            archived_at: null
        }

        const updated_note = {
            _id: note_id,
            user_id: user_id,
            is_pinned: true,
            version: 2
        }

        sinon.stub(notesModel,'findOne').resolves(existing_note)
        sinon.stub(notesModel,'findOneAndUpdate').resolves(updated_note)

        await noteService.updateNoteService(note_id,user_id,note_object)

        expect(notesModel.findOneAndUpdate.firstCall.args[1].pinned_at).to.not.equal(null)
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

    it('should return appropriate error message and status code if note id is invalid', async() => {

        const note_id = 'invalid-id'
        const user_id = '102f1f77bcf86bd799439042'

        const db_call_stub = sinon.stub(notesModel,'findOneAndDelete')

        var thrownError = null

        try {
            await noteService.deleteNoteService(note_id,user_id)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
        expect(db_call_stub.called).to.be.false
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

    it('should throw error with appropriate message and status code if note id is invalid', async () => {
        const note_id = 'invalid-id'
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        const db_call_stub = sinon.stub(notesModel,'findOne')

        var thrownError = null

        try {
            await noteService.getNoteService(note_id,user_id)
        }
        catch(err)
        {
            thrownError = err
        }

        expect(thrownError).to.not.equal(null)
        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
        expect(db_call_stub.called).to.be.false
    })
})

describe('All Notes Retrieval Service', () => {
    
    afterEach(() => {
        sinon.restore()
    })

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

describe('Note Export Service', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return the note title and stripped content', async () => {

        const note_id = '65c2a1f4e3b0c44298fc1c14'
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        const note = {
            _id: note_id,
            user_id: user_id,
            title: 'Kale Salad',
            content: '<p>Do not recommend</p>'
        }

        sinon.stub(notesModel,'findOne').resolves(note)

        const result = await noteService.exportNoteService(note_id,user_id)

        expect(result.title).to.equal('Kale Salad')
        expect(result.content).to.equal('Do not recommend')
    })

    it('should throw error with appropriate message and status code if note is not found', async () => {

        const note_id = '65c2a1f4e3b0c44298fc1c14'
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        sinon.stub(notesModel,'findOne').resolves(null)

        var thrownError = null

        try {
            await noteService.exportNoteService(note_id,user_id)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('No Note Found')
    })

    it('should throw error with appropriate message and status code if note id is invalid', async () => {

        const note_id = 'invalid-id'
        const user_id = '25c2a1f4e3b0d44298fc1c12'

        const db_call_stub = sinon.stub(notesModel,'findOne')

        var thrownError = null

        try {
            await noteService.exportNoteService(note_id,user_id)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(404)
        expect(thrownError.message).to.equal('Note Not Found')
        expect(db_call_stub.called).to.be.false
    })
})