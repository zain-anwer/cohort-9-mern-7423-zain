import {
    createNoteController,updateNoteController,
    deleteNoteController,
    getNoteController,getAllNotesController,
    exportNoteController,importNoteController
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
            body: fakeNote,
            log: {
                info: sinon.stub()
            }
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

    it('should default title to Untitled when title is missing but content is provided', async () => {

        const fakeNote = {
            content : 'It was fun',
            user_id : 'attacker.supplied.id'
        }

        const creationResult = {
            _id: '72170c5ah3d29e919f30b113',
            title: 'Untitled',
            content: fakeNote.content,
            user_id: '62170c5af3d27e919f30b100',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const req = {
            user: {
                id: '62170c5af3d27e919f30b100'
            },
            body: fakeNote,
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        sinon.stub(noteService,'createNoteService').resolves(creationResult)

        const next = sinon.spy()

        await createNoteController(req,res,next)

        expect(res.status.calledWith(201)).to.be.true
        expect(noteService.createNoteService.calledWithExactly(
            {user_id:req.user.id,title:'Untitled',content:fakeNote.content}
        )).to.be.true
        expect(res.json.calledWith(
            {
                'Message' : 'Note Created Successfully',
                'created_note' : creationResult
            }
        )).to.be.true
        expect(next.called).to.be.false
    })

    it('should return an appropriate error message and status code if title and content are both missing', async () => {

        const req = {
            user: {
                id: '62170c5af3d27e919f30b100'
            },
            body: {},
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        const create_note_service_stub = sinon.stub(noteService,'createNoteService')

        const next = sinon.spy()

        await createNoteController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('No Values Given')
        expect(create_note_service_stub.called).to.be.false
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
                user_id: 'attacker.supplied.id',
                version: 1
            },
            log: {
                info: sinon.stub()
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
            req.params.id,req.user.id,{title: req.body.title,content: req.body.content, is_pinned: undefined, is_binned: undefined, is_archived: undefined, version: req.body.version}
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
                content: 'Their dressing was the key to making it edible',
                version: 1
            },
            log: {
                info: sinon.stub()
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
            req.params.id,req.user.id,{title: req.body.title,content: req.body.content, is_pinned: undefined, is_binned: undefined, is_archived: undefined, version: req.body.version}
        )).to.be.true
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Note Not Found')
    })

    it('should return appropriate error code and message if title and content are both undefined', async () => {

        const req = {
            params: {
                id: '62170c5af3d27e919f30b100'
            },
            user: {
                id: '42170c5ak1d27e919f30b119'
            },
            body: {},
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        const update_note_service_stub = sinon.stub(noteService,'updateNoteService')

        const next = sinon.spy()

        await updateNoteController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('No Updated Values Given')
        expect(update_note_service_stub.called).to.be.false
    })

    it('should return appropriate error code and message if version is missing or not a number', async () => {

        const req = {
            params: {
                id: '62170c5af3d27e919f30b100'
            },
            user: {
                id: '42170c5ak1d27e919f30b119'
            },
            body: {
                title: 'Kale Salad At Olive Garden'
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        const update_note_service_stub = sinon.stub(noteService,'updateNoteService')

        const next = sinon.spy()

        await updateNoteController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('A valid version is required to update this note')
        expect(update_note_service_stub.called).to.be.false
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
            },
            log: {
                info: sinon.stub()
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
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking error */
        const fakeError = new Error('Note Not Found')
        fakeError.statusCode = 404

        /* stubbing service layer */
        sinon.stub(noteService,'deleteNoteService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await deleteNoteController(req,res,next)
        
        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Note Not Found')
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
            },
            log: {
                info: sinon.stub()
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
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        /* mocking error */
        const fakeError = new Error('Note Not Found')
        fakeError.statusCode = 404

        /* stubbing service layer */
        sinon.stub(noteService,'getNoteService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await getNoteController(req,res,next)
        
        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Note Not Found')
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
            },
            log: {
                info: sinon.stub()
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

    it('should send appropriate error message and status code if notes could not be retrieved', async() => {

        const req = {
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        const fakeError = new Error('Notes Not Found')
        fakeError.statusCode = 404

        sinon.stub(noteService,'getAllNotesService').rejects(fakeError)

        const next = sinon.spy()

        await getAllNotesController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('Notes Not Found')
    })
})

describe('Note Export Controller', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return note content as plain text attachment on success', async () => {

        const req = {
            params: {
                id: '65c2a1f4e3b0c44298fc1c14'
            },
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            setHeader: sinon.stub(),
            attachment: sinon.stub(),
            status: sinon.stub().returnsThis(),
            send: sinon.stub()
        }

        const exported_note = {
            title: 'Kale Salad',
            content: 'Do not recommend'
        }

        sinon.stub(noteService,'exportNoteService').resolves(exported_note)

        const next = sinon.spy()

        await exportNoteController(req,res,next)

        expect(res.setHeader.calledWith('Content-Type','text/plain')).to.be.true
        expect(res.attachment.calledWith(`${exported_note.title}.txt`)).to.be.true
        expect(res.status.calledWith(200)).to.be.true
        expect(res.send.calledWith(exported_note.content)).to.be.true
        expect(next.called).to.be.false
    })

    it('should send appropriate error message and status code if note is not found', async () => {

        const req = {
            params: {
                id: '65c2a1f4e3b0c44298fc1c14'
            },
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            setHeader: sinon.stub(),
            status: sinon.stub().returnsThis(),
            send: sinon.stub()
        }

        const fakeError = new Error('No Note Found')
        fakeError.statusCode = 404

        sinon.stub(noteService,'exportNoteService').rejects(fakeError)

        const next = sinon.spy()

        await exportNoteController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(404)
        expect(next.firstCall.args[0].message).to.equal('No Note Found')
    })
})

describe('Note Import Controller', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should create and return the imported note successfully', async () => {

        const req = {
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            },
            file: {
                originalname: 'MyNote.txt',
                buffer: Buffer.from('Imported content')
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const creationResult = {
            _id: '72170c5ah3d29e919f30b113',
            title: 'MyNote',
            content: 'Imported content',
            user_id: req.user.id
        }

        sinon.stub(noteService,'createNoteService').resolves(creationResult)

        const next = sinon.spy()

        await importNoteController(req,res,next)

        expect(res.status.calledWith(201)).to.be.true
        expect(noteService.createNoteService.calledWithExactly({
            user_id: req.user.id,
            title: 'MyNote',
            content: 'Imported content'
        })).to.be.true
        expect(res.json.calledWith({
            'Message': 'Note Imported Successfully',
            'created_note': creationResult
        })).to.be.true
        expect(next.called).to.be.false
    })

    it('should return appropriate error message and status code if no file is provided', async () => {

        const req = {
            user: {
                id: '15c2a1d4c3b0c34291fc1c02'
            },
            log: {
                info: sinon.stub()
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const create_note_service_stub = sinon.stub(noteService,'createNoteService')

        const next = sinon.spy()

        await importNoteController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('No File Provided')
        expect(create_note_service_stub.called).to.be.false
    })
})