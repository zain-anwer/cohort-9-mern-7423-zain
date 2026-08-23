import { expect } from 'chai'
import sinon from 'sinon'
import { errorMiddleware } from '../../src/middleware/error.middleware.js'

describe('errorMiddleware', () => {
    let req, res, next

    beforeEach(() => {
        req = { log: { error: sinon.stub() } }
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }
        next = sinon.stub()
    })

    it('responds with err.statusCode and err.message when statusCode is below 500', () => {
        const err = new Error('Note Not Found')
        err.statusCode = 404
        errorMiddleware(err, req, res, next)
        expect(res.status.calledWith(404)).to.be.true
        expect(res.json.calledWith({ message: 'Note Not Found' })).to.be.true
    })

    it('responds with 500 and a generic message when no statusCode is set', () => {
        const err = new Error('Something broke')
        errorMiddleware(err, req, res, next)
        expect(res.status.calledWith(500)).to.be.true
        expect(res.json.calledWith({ message: 'Internal Server Error' })).to.be.true
    })

    it('responds with a generic message when statusCode is 500 or higher', () => {
        const err = new Error('leaked internal detail')
        err.statusCode = 500
        errorMiddleware(err, req, res, next)
        expect(res.status.calledWith(500)).to.be.true
        expect(res.json.calledWith({ message: 'Internal Server Error' })).to.be.true
    })

    it('responds with 400 and a fixed message for CastError', () => {
        const err = new Error('Cast to ObjectId failed')
        err.name = 'CastError'
        err.statusCode = 500
        errorMiddleware(err, req, res, next)
        expect(res.status.calledWith(400)).to.be.true
        expect(res.json.calledWith({ message: 'Invalid request data' })).to.be.true
    })

    it('responds with 400 and a fixed message for ValidationError', () => {
        const err = new Error('Path is required')
        err.name = 'ValidationError'
        errorMiddleware(err, req, res, next)
        expect(res.status.calledWith(400)).to.be.true
        expect(res.json.calledWith({ message: 'Invalid request data' })).to.be.true
    })

    it('logs the error using req.log.error when available', () => {
        const err = new Error('logged error')
        errorMiddleware(err, req, res, next)
        expect(req.log.error.calledWith(err)).to.be.true
    })

    it('does not throw when req.log is undefined', () => {
        req = {}
        const err = new Error('no logger present')
        expect(() => errorMiddleware(err, req, res, next)).to.not.throw()
    })
})