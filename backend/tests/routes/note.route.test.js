import request from 'supertest'
import app from '../../src/app.js'
import noteService from '../../src/services/notes.service.js'
import tokenModel from '../../src/models/token.model.js'
import jwt from 'jsonwebtoken'
import {expect} from 'chai'
import sinon from 'sinon'

const validPayload = {
    userId: '62170c5af3d27e919f30b100',
    jti: 'mock-jti'
}

const authorizeAsValidUser = () => {
    sinon.stub(jwt,'verify').returns(validPayload)
    sinon.stub(tokenModel,'findOne').resolves(null)
}

describe('Notes Routes Authentication', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 401 if authorization header is missing', async () => {

        const res = await request(app).get('/api/notes')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Authorization Header Missing')
    })

    it('should return 401 if authorization scheme is not Bearer', async () => {

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Basic this.is.a.dummy.token')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Invalid Authorization Header')
    })

    it('should return 401 if Bearer scheme is present without a token', async () => {

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Bearer')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Invalid Authorization Header')
    })

    it('should return 401 if token is invalid or expired', async () => {

        sinon.stub(jwt,'verify').throws(new Error('jwt expired'))

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(401)
    })

    it('should return 401 if token payload is missing userId or jti', async () => {

        sinon.stub(jwt,'verify').returns({userId: validPayload.userId})

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Invalid Token')
    })

    it('should return 401 if token has been revoked', async () => {

        sinon.stub(jwt,'verify').returns(validPayload)
        sinon.stub(tokenModel,'findOne').resolves({jti: validPayload.jti})

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Unauthorized Access - token has been revoked')
    })

    it('should allow the request through if token is valid and not revoked', async () => {

        authorizeAsValidUser()
        sinon.stub(noteService,'getAllNotesService').resolves([])

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(200)
    })
})

describe('POST /api/notes', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 201 and the created note on success', async () => {

        authorizeAsValidUser()

        const fakeNote = {
            title: 'Friday Dinner',
            content: 'It was fun'
        }

        const creationResult = {
            _id: '72170c5ah3d29e919f30b113',
            ...fakeNote,
            user_id: validPayload.userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        sinon.stub(noteService,'createNoteService').resolves(creationResult)

        const res = await request(app)
            .post('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')
            .send(fakeNote)

        expect(res.status).to.equal(201)
        expect(res.body.Message).to.equal('Note Created Successfully')
        expect(res.body.created_note).to.deep.equal(creationResult)
        expect(noteService.createNoteService.calledWithExactly(
            {user_id: validPayload.userId, title: fakeNote.title, content: fakeNote.content}
        )).to.be.true
    })

    it('should return 400 if title and content are both missing', async () => {

        authorizeAsValidUser()

        const create_note_service_stub = sinon.stub(noteService,'createNoteService')

        const res = await request(app)
            .post('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')
            .send({})

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal('No Values Given')
        expect(create_note_service_stub.called).to.be.false
    })

    it('should return an appropriate error status code and message if creation fails', async () => {

        authorizeAsValidUser()

        const fakeError = new Error('Note Creation Failed')
        fakeError.statusCode = 500

        sinon.stub(noteService,'createNoteService').rejects(fakeError)

        const res = await request(app)
            .post('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')
            .send({title: 'Kale Salad', content: 'Not worth it'})

        expect(res.status).to.equal(500)
        expect(res.body.message).to.equal('Internal Server Error')
    })
})

describe('GET /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 200 and the requested note on success', async () => {

        authorizeAsValidUser()

        const retrieved_note = {
            _id: '65c2a1f4e3b0c44298fc1c14',
            user_id: validPayload.userId,
            title: 'Kale Salad',
            content: 'Not worth it',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        sinon.stub(noteService,'getNoteService').resolves(retrieved_note)

        const res = await request(app)
            .get('/api/notes/65c2a1f4e3b0c44298fc1c14')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(200)
        expect(res.body).to.deep.equal(retrieved_note)
        expect(noteService.getNoteService.calledWithExactly('65c2a1f4e3b0c44298fc1c14',validPayload.userId)).to.be.true
    })

    it('should return an appropriate error status code and message if note is not found', async () => {

        authorizeAsValidUser()

        const fakeError = new Error('Note Not Found')
        fakeError.statusCode = 404

        sinon.stub(noteService,'getNoteService').rejects(fakeError)

        const res = await request(app)
            .get('/api/notes/65c2a1f4e3b0c44298fc1c14')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(404)
        expect(res.body.message).to.equal('Note Not Found')
    })
})

describe('GET /api/notes', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 200 and all notes belonging to the user', async () => {

        authorizeAsValidUser()

        const notes = [{
            _id: '62170c5af3d27e919f30b100',
            user_id: validPayload.userId,
            title: 'Kale Salad',
            content: 'Not worth it',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }]

        sinon.stub(noteService,'getAllNotesService').resolves(notes)

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(200)
        expect(res.body).to.deep.equal(notes)
        expect(noteService.getAllNotesService.calledWithExactly(validPayload.userId)).to.be.true
    })
})

describe('PUT /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 200 and the updated note on success', async () => {

        authorizeAsValidUser()

        const updated_note = {
            _id: '62170c5af3d27e919f30b100',
            user_id: validPayload.userId,
            title: 'Kale Salad',
            content: 'Updated content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        sinon.stub(noteService,'updateNoteService').resolves(updated_note)

        const res = await request(app)
            .put('/api/notes/62170c5af3d27e919f30b100')
            .set('Authorization','Bearer this.is.a.dummy.token')
            .send({title: 'Kale Salad', content: 'Updated content'})

        expect(res.status).to.equal(200)
        expect(res.body.Message).to.equal('Note Updated Successfully')
        expect(res.body.updated_note).to.deep.equal(updated_note)
        expect(noteService.updateNoteService.calledWithExactly(
            '62170c5af3d27e919f30b100',validPayload.userId,{title: 'Kale Salad', content: 'Updated content'}
        )).to.be.true
    })

    it('should return an appropriate error status code and message if note is not found', async () => {

        authorizeAsValidUser()

        const fakeError = new Error('Note Not Found')
        fakeError.statusCode = 404

        sinon.stub(noteService,'updateNoteService').rejects(fakeError)

        const res = await request(app)
            .put('/api/notes/62170c5af3d27e919f30b100')
            .set('Authorization','Bearer this.is.a.dummy.token')
            .send({title: 'Kale Salad', content: 'Updated content'})

        expect(res.status).to.equal(404)
        expect(res.body.message).to.equal('Note Not Found')
    })
})

describe('DELETE /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 200 and the deleted note on success', async () => {

        authorizeAsValidUser()

        const deleted_note = {
            _id: '62170c5af3d27e919f30b100',
            user_id: validPayload.userId,
            title: 'Kale Salad',
            content: 'Not worth it',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        sinon.stub(noteService,'deleteNoteService').resolves(deleted_note)

        const res = await request(app)
            .delete('/api/notes/62170c5af3d27e919f30b100')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(200)
        expect(res.body.Message).to.equal('Note Deleted Successfully')
        expect(res.body.deleted_note).to.deep.equal(deleted_note)
        expect(noteService.deleteNoteService.calledWithExactly('62170c5af3d27e919f30b100',validPayload.userId)).to.be.true
    })

    it('should return an appropriate error status code and message if note is not found', async () => {

        authorizeAsValidUser()

        const fakeError = new Error('Record Not Found')
        fakeError.statusCode = 404

        sinon.stub(noteService,'deleteNoteService').rejects(fakeError)

        const res = await request(app)
            .delete('/api/notes/62170c5af3d27e919f30b100')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(404)
        expect(res.body.message).to.equal('Record Not Found')
    })
})