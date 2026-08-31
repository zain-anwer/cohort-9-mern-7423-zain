import express from 'express'
import request from 'supertest'
import { expect } from 'chai'
import sinon from 'sinon'
import esmock from 'esmock'
import profileService from '../../src/services/profile.service.js'
import { errorMiddleware } from '../../src/middleware/error.middleware.js'

const authenticatedMiddleware = (req, res, next) => {
    req.user = { id: 'u1' }
    next()
}

const rejectingMiddleware = (req, res, next) => {
    const err = new Error('Unauthorized')
    err.statusCode = 401
    next(err)
}

const buildApp = async (authImpl) => {
    const mod = await esmock('../../src/routes/profile.routes.js', {
        '../../src/middleware/auth.middleware.js': { default: authImpl }
    })
    const profileRoutes = mod.default

    const app = express()
    app.use(express.json())
    app.use('/api/profile', profileRoutes)
    app.use(errorMiddleware)
    return app
}

describe('profile.routes', () => {
    let sandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('PUT /api/profile/name', () => {
        it('returns 200 on a successful name change', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profileNameChangeService').resolves()

            const res = await request(app)
                .put('/api/profile/name')
                .send({ new_name: 'New Name' })

            expect(res.status).to.equal(200)
            expect(res.body).to.deep.equal({ message: 'Name Changed Successfully' })
        })

        it('forwards service errors through the error middleware', async () => {
            const app = await buildApp(authenticatedMiddleware)
            const error = new Error('Error Updating Name')
            error.statusCode = 500
            sandbox.stub(profileService, 'profileNameChangeService').rejects(error)

            const res = await request(app)
                .put('/api/profile/name')
                .send({ new_name: 'New Name' })

            expect(res.status).to.equal(500)
        })
    })

    describe('PUT /api/profile/password', () => {
        it('returns 200 on a successful password change', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profilePasswordChangeService').resolves()

            const res = await request(app)
                .put('/api/profile/password')
                .send({ old_password: 'oldpassword', new_password: 'newpassword' })

            expect(res.status).to.equal(200)
            expect(res.body).to.deep.equal({ message: 'Password Changed Successfully' })
        })

        it('returns the service statusCode on failure', async () => {
            const app = await buildApp(authenticatedMiddleware)
            const error = new Error('Incorrect Password')
            error.statusCode = 401
            sandbox.stub(profileService, 'profilePasswordChangeService').rejects(error)

            const res = await request(app)
                .put('/api/profile/password')
                .send({ old_password: 'wrong', new_password: 'newpassword' })

            expect(res.status).to.equal(401)
        })
    })

    describe('DELETE /api/profile', () => {
        it('returns 200 on a successful delete', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profileDeleteService').resolves()

            const res = await request(app).delete('/api/profile')

            expect(res.status).to.equal(200)
            expect(res.body).to.deep.equal({ message: 'Account Deleted Successfully' })
        })
    })

    describe('PUT /api/profile/picture', () => {
        it('returns 200 when a valid image is uploaded', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profilePictureUpdateService').resolves()

            const res = await request(app)
                .put('/api/profile/picture')
                .attach('file', Buffer.from('fake-image-data'), { filename: 'avatar.png', contentType: 'image/png' })

            expect(res.status).to.equal(200)
            expect(res.body).to.deep.equal({ message: 'Profile Picture Updated Successfully' })
        })

        it('returns 400 when the mimetype is not allowed', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profilePictureUpdateService').resolves()

            const res = await request(app)
                .put('/api/profile/picture')
                .attach('file', Buffer.from('not-an-image'), { filename: 'file.txt', contentType: 'text/plain' })

            expect(res.status).to.equal(400)
            expect(profileService.profilePictureUpdateService.called).to.be.false
        })

        it('returns 400 when no file is attached', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profilePictureUpdateService').resolves()

            const res = await request(app).put('/api/profile/picture')

            expect(res.status).to.equal(400)
        })
    })

    describe('DELETE /api/profile/picture', () => {
        it('returns 200 on a successful picture delete', async () => {
            const app = await buildApp(authenticatedMiddleware)
            sandbox.stub(profileService, 'profilePictureDeleteService').resolves()

            const res = await request(app).delete('/api/profile/picture')

            expect(res.status).to.equal(200)
            expect(res.body).to.deep.equal({ message: 'Profile Picture Removed Successfully' })
        })
    })

    it('rejects all routes when auth fails', async () => {
        const app = await buildApp(rejectingMiddleware)

        const res = await request(app).delete('/api/profile')

        expect(res.status).to.equal(401)
    })
})