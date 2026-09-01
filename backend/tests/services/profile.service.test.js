import { expect } from 'chai'
import sinon from 'sinon'
import esmock from 'esmock'
import bcrypt from 'bcrypt'
import cloudinary from '../../src/configs/cloudinary.js'
import userModel from '../../src/models/users.model.js'
import { profileEvent } from '../../src/events/profile.event.js'
import logger from '../../src/configs/logger.js'
import profileService from '../../src/services/profile.service.js'

const loadServiceWithGetIO = async (getIOStub) => {
    const mod = await esmock('../../src/services/profile.service.js', {
        '../../src/socket/socket.js': { getIO: getIOStub }
    })
    return mod.default
}

describe('profile.service', () => {
    let sandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('profileFetchService', () => {
        const user_id = 'u1'

        it('returns the name, email and profile_picture on success', async () => {
            sandbox.stub(userModel, 'findOne').resolves({
                name: 'John',
                email: 'john@example.com',
                profile_picture: 'https://cdn.example.com/u1.png'
            })

            const result = await profileService.profileFetchService(user_id)

            expect(userModel.findOne.calledWith({ _id: user_id })).to.be.true
            expect(result).to.deep.equal({
                name: 'John',
                email: 'john@example.com',
                profile_picture: 'https://cdn.example.com/u1.png'
            })
        })

        it('throws a 404 error when the user is not found', async () => {
            sandbox.stub(userModel, 'findOne').resolves(null)

            try {
                await profileService.profileFetchService(user_id)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('User Not Found')
                expect(err.statusCode).to.equal(404)
            }
        })

        it('throws a 500 error if the lookup fails', async () => {
            sandbox.stub(userModel, 'findOne').rejects(new Error('db down'))

            try {
                await profileService.profileFetchService(user_id)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error Accessing User Record')
                expect(err.statusCode).to.equal(500)
            }
        })
    })

    describe('profileNameChangeService', () => {
        it('updates the name and emits update:name', async () => {
            const updatedUser = { _id: 'u1', name: 'New Name', updatedAt: new Date('2026-01-01') }
            sandbox.stub(userModel, 'findOneAndUpdate').resolves(updatedUser)
            const emitSpy = sandbox.stub(profileEvent, 'emit')

            await profileService.profileNameChangeService('u1', 'New Name')

            expect(userModel.findOneAndUpdate.calledOnce).to.be.true
            expect(emitSpy.calledWith('update:name', {
                user_id: 'u1',
                new_name: 'New Name',
                updated_at: updatedUser.updatedAt
            })).to.be.true
        })

        it('throws a 400 error when new_name is not a string', async () => {
            try {
                await profileService.profileNameChangeService('u1', undefined)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Invalid Name')
                expect(err.statusCode).to.equal(400)
            }
        })

        it('throws a 400 error when new_name is empty or whitespace', async () => {
            try {
                await profileService.profileNameChangeService('u1', '   ')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Invalid Name')
                expect(err.statusCode).to.equal(400)
            }
        })

        it('throws a 404 error if the user is not found', async () => {
            sandbox.stub(userModel, 'findOneAndUpdate').resolves(null)

            try {
                await profileService.profileNameChangeService('u1', 'New Name')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('User Not Found')
                expect(err.statusCode).to.equal(404)
            }
        })

        it('throws a 500 error if the update fails', async () => {
            sandbox.stub(userModel, 'findOneAndUpdate').rejects(new Error('db down'))

            try {
                await profileService.profileNameChangeService('u1', 'New Name')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error Updating Name')
                expect(err.statusCode).to.equal(500)
            }
        })
    })

    describe('profilePasswordChangeService', () => {
        const user_id = 'u1'

        it('rejects when old and new password are the same', async () => {
            try {
                await profileService.profilePasswordChangeService(user_id, 'samepass1', 'samepass1')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.statusCode).to.equal(400)
            }
        })

        it('rejects when new password is shorter than 8 characters', async () => {
            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpass1', 'short')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.statusCode).to.equal(400)
            }
        })

        it('rejects when old_password or new_password is not a string', async () => {
            try {
                await profileService.profilePasswordChangeService(user_id, undefined, 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.statusCode).to.equal(400)
            }
        })

        it('throws 500 if the user cannot be fetched', async () => {
            sandbox.stub(userModel, 'findOne').rejects(new Error('db down'))

            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Unable To Fetch User')
                expect(err.statusCode).to.equal(500)
            }
        })

        it('throws 404 if the user is not found', async () => {
            sandbox.stub(userModel, 'findOne').resolves(null)

            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('User Not Found')
                expect(err.statusCode).to.equal(404)
            }
        })

        it('throws 500 if bcrypt.compare errors', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ password: 'hashed' })
            sandbox.stub(bcrypt, 'compare').rejects(new Error('bcrypt error'))

            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error In Password Validation')
                expect(err.statusCode).to.equal(500)
            }
        })

        it('throws 401 when the old password does not match', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ password: 'hashed' })
            sandbox.stub(bcrypt, 'compare').resolves(false)

            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Incorrect Password')
                expect(err.statusCode).to.equal(401)
            }
        })

        it('throws 500 if bcrypt.hash rejects', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ password: 'hashed' })
            sandbox.stub(bcrypt, 'compare').resolves(true)
            sandbox.stub(bcrypt, 'hash').rejects(new Error('hash error'))

            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error In Password Encryption')
                expect(err.statusCode).to.equal(500)
            }
        })

        it('throws 500 if the password update fails', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ password: 'hashed' })
            sandbox.stub(bcrypt, 'compare').resolves(true)
            sandbox.stub(bcrypt, 'hash').resolves('newhashed')
            sandbox.stub(userModel, 'findOneAndUpdate').rejects(new Error('db down'))

            try {
                await profileService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error in updating password')
                expect(err.statusCode).to.equal(500)
            }
        })

        it('force-disconnects sockets after a successful password change', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ password: 'hashed' })
            sandbox.stub(bcrypt, 'compare').resolves(true)
            sandbox.stub(bcrypt, 'hash').resolves('newhashed')
            sandbox.stub(userModel, 'findOneAndUpdate').resolves({})
            const disconnectSockets = sinon.stub()
            const inStub = sinon.stub().returns({ disconnectSockets })
            const getIOStub = sinon.stub().returns({ in: inStub })
            const mockedService = await loadServiceWithGetIO(getIOStub)

            await mockedService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')

            expect(inStub.calledWith(`user_id:${user_id}`)).to.be.true
            expect(disconnectSockets.calledWith(true)).to.be.true
        })

        it('does not throw if the socket disconnect fails', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ password: 'hashed' })
            sandbox.stub(bcrypt, 'compare').resolves(true)
            sandbox.stub(bcrypt, 'hash').resolves('newhashed')
            sandbox.stub(userModel, 'findOneAndUpdate').resolves({})
            const getIOStub = sinon.stub().throws(new Error('io not ready'))
            const mockedService = await loadServiceWithGetIO(getIOStub)
            const loggerSpy = sandbox.stub(logger, 'error')

            await mockedService.profilePasswordChangeService(user_id, 'oldpassword', 'newpassword')

            expect(loggerSpy.calledOnce).to.be.true
        })
    })

    describe('profilePictureUpdateService', () => {
        const user_id = 'u1'
        const image = Buffer.from('fake-image-data')
        const mimetype = 'image/png'

        it('uploads the new image, updates the user, emits update:picture, cleans up the old image and returns the secure_url', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: 'old-pic' })
            sandbox.stub(cloudinary.uploader, 'upload').resolves({ secure_url: 'https://new-url', public_id: 'new-pic' })
            const updatedUser = { updatedAt: new Date('2026-01-01') }
            sandbox.stub(userModel, 'findOneAndUpdate').resolves(updatedUser)
            const emitSpy = sandbox.stub(profileEvent, 'emit')
            const destroyStub = sandbox.stub(cloudinary.uploader, 'destroy').resolves({})

            const result = await profileService.profilePictureUpdateService(user_id, image, mimetype)

            expect(cloudinary.uploader.upload.calledOnce).to.be.true
            expect(emitSpy.calledWith('update:picture', {
                user_id,
                new_image: 'https://new-url',
                updated_at: updatedUser.updatedAt
            })).to.be.true
            expect(destroyStub.calledWith('old-pic')).to.be.true
            expect(result).to.equal('https://new-url')
        })

        it('skips cleanup when there was no previous picture', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: null })
            sandbox.stub(cloudinary.uploader, 'upload').resolves({ secure_url: 'https://new-url', public_id: 'new-pic' })
            sandbox.stub(userModel, 'findOneAndUpdate').resolves({ updatedAt: new Date() })
            sandbox.stub(profileEvent, 'emit')
            const destroyStub = sandbox.stub(cloudinary.uploader, 'destroy').resolves({})

            await profileService.profilePictureUpdateService(user_id, image, mimetype)

            expect(destroyStub.called).to.be.false
        })

        it('does not throw if cleanup of the old image fails', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: 'old-pic' })
            sandbox.stub(cloudinary.uploader, 'upload').resolves({ secure_url: 'https://new-url', public_id: 'new-pic' })
            sandbox.stub(userModel, 'findOneAndUpdate').resolves({ updatedAt: new Date() })
            sandbox.stub(profileEvent, 'emit')
            sandbox.stub(cloudinary.uploader, 'destroy').rejects(new Error('cleanup failed'))
            const loggerSpy = sandbox.stub(logger, 'error')

            await profileService.profilePictureUpdateService(user_id, image, mimetype)

            expect(loggerSpy.calledOnce).to.be.true
        })

        it('throws a 404 error when the user is not found', async () => {
            sandbox.stub(userModel, 'findOne').resolves(null)

            try {
                await profileService.profilePictureUpdateService(user_id, image, mimetype)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('User Not Found')
                expect(err.statusCode).to.equal(404)
            }
        })

        it('throws a 500 error if the user lookup fails', async () => {
            sandbox.stub(userModel, 'findOne').rejects(new Error('db down'))

            try {
                await profileService.profilePictureUpdateService(user_id, image, mimetype)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error updating profile picture')
                expect(err.statusCode).to.equal(500)
            }
        })

        it('throws a 500 error if the upload fails', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: 'old-pic' })
            sandbox.stub(cloudinary.uploader, 'upload').rejects(new Error('upload failed'))

            try {
                await profileService.profilePictureUpdateService(user_id, image, mimetype)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error updating profile picture')
                expect(err.statusCode).to.equal(500)
            }
        })
    })

    describe('profilePictureDeleteService', () => {
        const user_id = 'u1'

        it('destroys the image, clears the fields and emits delete:picture', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: 'pic123' })
            const destroyStub = sandbox.stub(cloudinary.uploader, 'destroy').resolves({})
            const updatedUser = { updatedAt: new Date('2026-01-01') }
            sandbox.stub(userModel, 'findOneAndUpdate').resolves(updatedUser)
            const emitSpy = sandbox.stub(profileEvent, 'emit')

            await profileService.profilePictureDeleteService(user_id)

            expect(destroyStub.calledWith('pic123')).to.be.true
            expect(emitSpy.calledWith('delete:picture', {
                user_id,
                updated_at: updatedUser.updatedAt
            })).to.be.true
        })

        it('does nothing and does not emit when there is no picture', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: null })
            const destroyStub = sandbox.stub(cloudinary.uploader, 'destroy').resolves({})
            const emitSpy = sandbox.stub(profileEvent, 'emit')

            await profileService.profilePictureDeleteService(user_id)

            expect(destroyStub.called).to.be.false
            expect(emitSpy.called).to.be.false
        })

        it('throws a 404 error when the user is not found', async () => {
            sandbox.stub(userModel, 'findOne').resolves(null)

            try {
                await profileService.profilePictureDeleteService(user_id)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('User Not Found')
                expect(err.statusCode).to.equal(404)
            }
        })

        it('throws a 500 error if the lookup fails', async () => {
            sandbox.stub(userModel, 'findOne').rejects(new Error('db down'))

            try {
                await profileService.profilePictureDeleteService(user_id)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error Deleting Profile Picture')
                expect(err.statusCode).to.equal(500)
            }
        })

        it('throws a 500 error if deletion fails', async () => {
            sandbox.stub(userModel, 'findOne').resolves({ public_id: 'pic123' })
            sandbox.stub(cloudinary.uploader, 'destroy').rejects(new Error('cloudinary down'))

            try {
                await profileService.profilePictureDeleteService(user_id)
                expect.fail('expected error to be thrown')
            } catch (err) {
                expect(err.message).to.equal('Error Deleting Profile Picture')
                expect(err.statusCode).to.equal(500)
            }
        })
    })
})