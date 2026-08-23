import { expect } from 'chai'
import sinon from 'sinon'
import jwt from 'jsonwebtoken'
import revokedNoteModel from '../../src/models/token.model.js'

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'

const { default: authMiddleware } = await import('../../src/middleware/auth.middleware.js')

describe('authMiddleware', () => {
    let req, res, next

    beforeEach(() => {
        req = { headers: {} }
        res = {}
        next = sinon.stub()
    })

    afterEach(() => {
        sinon.restore()
    })

    it('calls next with 401 when authorization header missing', async () => {
        await authMiddleware(req, res, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
        expect(err.message).to.equal('Authorization Header Missing')
    })

    it('calls next with 401 when scheme is not Bearer', async () => {
        req.headers.authorization = 'Basic sometoken'
        await authMiddleware(req, res, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
        expect(err.message).to.equal('Invalid Authorization Header')
    })

    it('calls next with 401 when token missing after scheme', async () => {
        req.headers.authorization = 'Bearer '
        await authMiddleware(req, res, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
    })

    it('calls next with 401 when jwt.verify throws', async () => {
        req.headers.authorization = 'Bearer badtoken'
        sinon.stub(jwt, 'verify').throws(new Error('jwt malformed'))
        await authMiddleware(req, res, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
    })

    it('calls next with 401 when payload missing jti or userId', async () => {
        req.headers.authorization = 'Bearer validtoken'
        sinon.stub(jwt, 'verify').returns({ userId: 'abc123' })
        await authMiddleware(req, res, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
        expect(err.message).to.equal('Invalid Token')
    })

    it('calls next with 401 when token has been revoked', async () => {
        req.headers.authorization = 'Bearer validtoken'
        sinon.stub(jwt, 'verify').returns({ userId: 'abc123', jti: 'jti123' })
        sinon.stub(revokedNoteModel, 'findOne').resolves({ jti: 'jti123' })
        await authMiddleware(req, res, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
        expect(err.message).to.equal('Unauthorized Access - token has been revoked')
    })

    it('calls next with the raw error when revokedNoteModel.findOne rejects', async () => {
        req.headers.authorization = 'Bearer validtoken'
        sinon.stub(jwt, 'verify').returns({ userId: 'abc123', jti: 'jti123' })
        const dbError = new Error('DB Error')
        sinon.stub(revokedNoteModel, 'findOne').rejects(dbError)
        await authMiddleware(req, res, next)
        expect(next.firstCall.args[0]).to.equal(dbError)
    })

    it('sets req.user and calls next with no arguments on valid token', async () => {
        req.headers.authorization = 'Bearer validtoken'
        sinon.stub(jwt, 'verify').returns({ userId: 'abc123', jti: 'jti123' })
        sinon.stub(revokedNoteModel, 'findOne').resolves(null)
        await authMiddleware(req, res, next)
        expect(req.user.id).to.equal('abc123')
        expect(next.calledOnceWithExactly()).to.be.true
    })
})