import { expect } from 'chai'
import sinon from 'sinon'
import jwt from 'jsonwebtoken'
import { socketMiddleware } from '../../src/middleware/socket.middleware.js'

describe('socketMiddleware', () => {
    let socket, next

    beforeEach(() => {
        socket = { handshake: { auth: {} } }
        next = sinon.stub()
    })

    afterEach(() => {
        sinon.restore()
    })

    it('calls next with 401 when token is missing', () => {
        socketMiddleware(socket, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
        expect(err.message).to.equal('Token Missing')
    })

    it('calls next with 401 when jwt.verify throws', () => {
        socket.handshake.auth.token = 'badtoken'
        sinon.stub(jwt, 'verify').throws(new Error('jwt malformed'))
        socketMiddleware(socket, next)
        const err = next.firstCall.args[0]
        expect(err.statusCode).to.equal(401)
        expect(err.message).to.equal('Invalid Token')
    })

    it('sets socket.user and calls next with no arguments on a valid token', () => {
        socket.handshake.auth.token = 'goodtoken'
        sinon.stub(jwt, 'verify').returns({ userId: 'abc123' })
        socketMiddleware(socket, next)
        expect(socket.user.id).to.equal('abc123')
        expect(next.calledOnceWithExactly()).to.be.true
    })
})