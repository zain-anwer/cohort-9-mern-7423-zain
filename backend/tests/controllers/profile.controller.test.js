import { expect } from 'chai'
import sinon from 'sinon'
import profileService from '../../src/services/profile.service.js'
import {
    profileNameChangeController,
    profilePasswordChangeController,
    profileDeleteController,
    profilePictureUpdateController,
    profilePictureDeleteController
} from '../../src/controllers/profile.controller.js'

const buildRes = () => {
    const res = {}
    res.status = sinon.stub().returns(res)
    res.json = sinon.stub().returns(res)
    return res
}

describe('profile.controller', () => {
    let sandbox, req, res, next

    beforeEach(() => {
        sandbox = sinon.createSandbox()
        req = { user: { id: 'u1' }, body: {}, file: undefined }
        res = buildRes()
        next = sinon.stub()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('profileNameChangeController', () => {
        it('responds 200 on success', async () => {
            req.body = { new_name: 'New Name' }
            sandbox.stub(profileService, 'profileNameChangeService').resolves()

            await profileNameChangeController(req, res, next)

            expect(profileService.profileNameChangeService.calledWith('u1', 'New Name')).to.be.true
            expect(res.status.calledWith(200)).to.be.true
            expect(res.json.calledWith({ message: 'Name Changed Successfully' })).to.be.true
            expect(next.called).to.be.false
        })

        it('forwards errors to next', async () => {
            req.body = { new_name: 'New Name' }
            const error = new Error('Error Updating Name')
            error.statusCode = 500
            sandbox.stub(profileService, 'profileNameChangeService').rejects(error)

            await profileNameChangeController(req, res, next)

            expect(next.calledWith(error)).to.be.true
            expect(res.status.called).to.be.false
        })
    })

    describe('profilePasswordChangeController', () => {
        it('responds 200 on success', async () => {
            req.body = { old_password: 'old', new_password: 'newpassword' }
            sandbox.stub(profileService, 'profilePasswordChangeService').resolves()

            await profilePasswordChangeController(req, res, next)

            expect(profileService.profilePasswordChangeService.calledWith('u1', 'old', 'newpassword')).to.be.true
            expect(res.status.calledWith(200)).to.be.true
            expect(res.json.calledWith({ message: 'Password Changed Successfully' })).to.be.true
        })

        it('forwards errors to next', async () => {
            req.body = { old_password: 'old', new_password: 'newpassword' }
            const error = new Error('Incorrect Password')
            error.statusCode = 401
            sandbox.stub(profileService, 'profilePasswordChangeService').rejects(error)

            await profilePasswordChangeController(req, res, next)

            expect(next.calledWith(error)).to.be.true
        })
    })

    describe('profileDeleteController', () => {
        it('responds 200 on success', async () => {
            sandbox.stub(profileService, 'profileDeleteService').resolves()

            await profileDeleteController(req, res, next)

            expect(profileService.profileDeleteService.calledWith('u1')).to.be.true
            expect(res.status.calledWith(200)).to.be.true
            expect(res.json.calledWith({ message: 'Account Deleted Successfully' })).to.be.true
        })

        it('forwards errors to next', async () => {
            const error = new Error('Error in deleting user account')
            error.statusCode = 500
            sandbox.stub(profileService, 'profileDeleteService').rejects(error)

            await profileDeleteController(req, res, next)

            expect(next.calledWith(error)).to.be.true
        })
    })

    describe('profilePictureUpdateController', () => {
        it('responds 200 on success', async () => {
            req.file = { buffer: Buffer.from('fake'), mimetype: 'image/png' }
            sandbox.stub(profileService, 'profilePictureUpdateService').resolves()

            await profilePictureUpdateController(req, res, next)

            expect(profileService.profilePictureUpdateService.calledWith('u1', req.file.buffer, 'image/png')).to.be.true
            expect(res.status.calledWith(200)).to.be.true
            expect(res.json.calledWith({ message: 'Profile Picture Updated Successfully' })).to.be.true
        })

        it('calls next with a 400 error when no file is present', async () => {
            req.file = undefined
            sandbox.stub(profileService, 'profilePictureUpdateService').resolves()

            await profilePictureUpdateController(req, res, next)

            expect(profileService.profilePictureUpdateService.called).to.be.false
            expect(next.calledOnce).to.be.true
            const err = next.firstCall.args[0]
            expect(err.statusCode).to.equal(400)
        })

        it('forwards service errors to next', async () => {
            req.file = { buffer: Buffer.from('fake'), mimetype: 'image/png' }
            const error = new Error('Error updating profile picture')
            error.statusCode = 500
            sandbox.stub(profileService, 'profilePictureUpdateService').rejects(error)

            await profilePictureUpdateController(req, res, next)

            expect(next.calledWith(error)).to.be.true
        })
    })

    describe('profilePictureDeleteController', () => {
        it('responds 200 on success', async () => {
            sandbox.stub(profileService, 'profilePictureDeleteService').resolves()

            await profilePictureDeleteController(req, res, next)

            expect(profileService.profilePictureDeleteService.calledWith('u1')).to.be.true
            expect(res.status.calledWith(200)).to.be.true
            expect(res.json.calledWith({ message: 'Profile Picture Removed Successfully' })).to.be.true
        })

        it('forwards errors to next', async () => {
            const error = new Error('Error Deleting Profile Picture')
            error.statusCode = 500
            sandbox.stub(profileService, 'profilePictureDeleteService').rejects(error)

            await profilePictureDeleteController(req, res, next)

            expect(next.calledWith(error)).to.be.true
        })
    })
})