import {
    createNoteController,updateNoteController,
    deleteNoteController,
    getNoteController,getAllNotesController,
} 
from '../../src/controllers/notes.controller.js'
import noteService from '../../src/services/notes.service.js'
import {expect} from 'chai'
import sinon from 'sinon'

describe('Note Creation Controller', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should create and return created note successfully with appropriate status code', async () => {

        /* mock request response objects */

        const fakeNote = {
            title   : 'Friday Dinner',
            content : 'It was fun',
            user_id : 'attacker.supplied.id'
        }

        const creationResult = {
            _id: '72170c5ah3d29e919f30b113',
            ...fakeNote,
            user_id: '62170c5af3d27e919f30b100',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const req = {
            user: {
                id: '62170c5af3d27e919f30b100'
            },
            body: fakeNote
        }

        /* we make them separate properties so they calls to them can be tracked */
        /* returnsThis ensures .json() can be chained because res.status() returns res */
        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* stubbing service layer */
        sinon.stub(noteService,'createNoteService').resolves(creationResult)

        /* stubbing error middleware function */
        const next = sinon.spy()

        /* controller call */
        await createNoteController(req,res,next)
        
        /* assertions */
        expect(res.status.calledWith(201)).to.be.true
        expect(noteService.createNoteService.calledWithExactly(
            {user_id:req.user.id,title:fakeNote.title,content:fakeNote.content}
        )).to.be.true
        expect(res.json.calledWith(
            {
                'Message' : 'Note Created Successfully',
                'created_note' : creationResult
            }
        )).to.be.true
        expect(next.called).to.be.false
    })
})

describe('Note Updation Controller', () => {
  
    afterEach(() => {
            sinon.restore()
    })

    it('should update and return updated note successfully with appropriate status code', async () => {

        /* mock request, response objects */

        const req = {
            params: {
                id: '62170c5af3d27e919f30b100'
            },
            user: {
                id: '42170c5ak1d27e919f30b119'
            },
            body: {
                title: 'Kale Salad At Olive Garden',
                content: 'I liked this one',
                user_id: 'attacker.supplied.id'
            }
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        /* fake updated note */

        const updated_note = {
            _id : '62170c5af3d27e919f30b100',
            user_id : '42170c5ak1d27e919f30b119',
            title: 'Kale Salad',
            content: 'Need to have four stomach chambers like cows to digest this',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        /* stubbing service layer */
        sinon.stub(noteService,'updateNoteService').resolves(updated_note)

        /* stubbing error middleware */
        const next = sinon.spy()

        await updateNoteController(req,res,next)

        /* assertions */
        expect(res.status.calledWith(200)).to.be.true
         expect(noteService.updateNoteService.calledWithExactly(
            req.params.id,req.user.id,{title: req.body.title,content: req.body.content}
        )).to.be.true
        expect(res.json.calledWith(
            {
                Message: 'Note Updated Successfully',
                updated_note: updated_note
            }
        )).to.be.true

        expect(next.called).to.be.false
    })

    it('should return appropriate error code and message if note is not found', async () => {

        /* mock request, response objects */

        const req = {
            params: {
                id: '62170c5af3d27e919f30b100'
            },
            user: {
                id: '42170c5ak1d27e919f30b119'
            },
            body: {
                title: 'Kale Salad At Olive Garden',
                content: 'Their dressing was the key to making it edible'
            }
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        /* mocking error */
        const fakeError = new Error('Note Not Found')
        fakeError.statusCode = 404

        /* stubbing service layer */
        sinon.stub(noteService,'updateNoteService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await updateNoteController(req,res,next)

        /* assertions */
        expect(noteService.updateNoteService.calledWithExactly(
            req.params.id,req.user.id,{title: req.body.title,content: req.body.content}
        )).to.be.true
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Note Not Found')
    })
})

describe('Note Deletion Controller', () => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully delete note and output appropriate message and status code', async() => {

        /* stubbing request, response objects */

        const req = {
            params: {
                id: '65c2a1f4e3b0c44298fc1c14'
            },
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking deleted note */
    
        const deleted_note = {
            _id : '62170c5af3d27e919f30b100',
            user_id : '42170c5ak1d27e919f30b119',
            title: 'Kale Salad',
            content: 'Need to have four stomach chambers like cows to digest this',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        /* stubbing service layer */
        sinon.stub(noteService,'deleteNoteService').resolves(deleted_note)

        /* stubbing error middleware */
        const next = sinon.spy()

        await deleteNoteController(req,res,next)
        
        /* assertions */
        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith({
            Message: 'Note Deleted Successfully',
            deleted_note: deleted_note
        })).to.be.true
        expect(next.called).to.be.false
    })

    it('should send appropriate error message and status code if note is not found', async() => {

        /* stubbing request, response objects */

        const req = {
            params: {
                id: '65c2a1f4e3b0c44298fc1c14'
            },
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking error */
        const fakeError = new Error('Record Not Found')
        fakeError.statusCode = 404

        /* stubbing service layer */
        sinon.stub(noteService,'deleteNoteService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await deleteNoteController(req,res,next)
        
        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Record Not Found')
    })

})


describe('Note Retrieval Controller', () => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully retrieve note and output appropriate message and status code', async() => {

        /* stubbing request, response objects */

        const req = {
            params: {
                id: '65c2a1f4e3b0c44298fc1c14'
            },
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking retrieved note */
    
        const retrieved_note = {
            _id : '62170c5af3d27e919f30b100',
            user_id : '42170c5ak1d27e919f30b119',
            title: 'Kale Salad',
            content: 'Need to have four stomach chambers like cows to digest this',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        /* stubbing service layer */
        sinon.stub(noteService,'getNoteService').resolves(retrieved_note)

        /* stubbing error middleware */
        const next = sinon.spy()

        await getNoteController(req,res,next)
        
        /* assertions */
        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith(retrieved_note)).to.be.true
        expect(next.called).to.be.false
    })

    it('should send appropriate error message and status code if note is not found', async() => {

        /* stubbing request, response objects */

        const req = {
            params: {
                id: '65c2a1f4e3b0c44298fc1c14'
            },
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking error */
        const fakeError = new Error('Record Not Found')
        fakeError.statusCode = 404

        /* stubbing service layer */
        sinon.stub(noteService,'getNoteService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await getNoteController(req,res,next)
        
        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Record Not Found')
    })

})



describe('All Notes Retrieval Controller', () => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully retrieve all notes and output appropriate message and status code', async() => {

        /* stubbing request, response objects */

        const req = {
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking retrieved note */
    
        const notes = [{
            _id : '62170c5af3d27e919f30b100',
            user_id : '42170c5ak1d27e919f30b119',
            title: 'Kale Salad',
            content: 'Need to have four stomach chambers like cows to digest this',
            createdAt: new Date(),
            updatedAt: new Date(),
        }]

        /* stubbing service layer */
        sinon.stub(noteService,'getAllNotesService').resolves(notes)

        /* stubbing error middleware */
        const next = sinon.spy()

        await getAllNotesController(req,res,next)
        
        /* assertions */
        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith(notes)).to.be.true
        expect(next.called).to.be.false
    })
})

