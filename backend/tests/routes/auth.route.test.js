import request from 'supertest'
import app from '../../src/app.js'
import authService from '../../src/services/auth.service.js'
import {expect} from 'chai'
import sinon from 'sinon'

describe('POST /api/auth/signup', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 201 and an access token on successful signup', async () => {

        const fakeUser = {
            name     : 'Umair Raza',
            email    : 'umair.raza@gmail.com',
            password : '12345678'
        }

        sinon.stub(authService,'signupService').resolves({
            access_token: 'this.is.a.dummy.access.token',
            user: {
                _id: '507f1f77bcf86cd799439011',
                name: 'Umair Raza',
                email: 'umair.raza@gmail.com'
            }
        })

        const res = await request(app).post('/api/auth/signup').send(fakeUser)

        expect(res.status).to.equal(201)
        expect(res.body.status).to.equal('Signup Successful')
        expect(res.body.access_token).to.equal('this.is.a.dummy.access.token')
        expect(res.body.user).to.deep.equal({
            _id: '507f1f77bcf86cd799439011',
            name: 'Umair Raza',
            email: 'umair.raza@gmail.com'
        })
    })

    it('should return an appropriate error status code and message if signup fails', async () => {

        const fakeUser = {
            email    : 'umair.raza@gmail.com',
            password : '12345678'
        }

        const fakeError = new Error('All Fields Required')
        fakeError.statusCode = 400

        sinon.stub(authService,'signupService').rejects(fakeError)

        const res = await request(app).post('/api/auth/signup').send(fakeUser)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal('All Fields Required')
    })
})

describe('POST /api/auth/signin', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 200 and an access token on successful signin', async () => {

        const fakeUser = {
            email    : 'umair.raza@gmail.com',
            password : '12345678'
        }

        sinon.stub(authService,'signinService').resolves({
            access_token: 'this.is.a.dummy.access.token',
            user: {
                _id: '507f1f77bcf86cd799439011',
                name: 'Umair Raza',
                email: 'umair.raza@gmail.com'
            }
        })

        const res = await request(app).post('/api/auth/signin').send(fakeUser)

        expect(res.status).to.equal(200)
        expect(res.body.status).to.equal('Signin Successful')
        expect(res.body.access_token).to.equal('this.is.a.dummy.access.token')
        expect(res.body.user).to.deep.equal({
            _id: '507f1f77bcf86cd799439011',
            name: 'Umair Raza',
            email: 'umair.raza@gmail.com'
        })
    })

    it('should return an appropriate error status code and message if signin fails', async () => {

        const fakeUser = {
            email    : 'umair.raza@gmail.com',
            password : '12345678'
        }

        const fakeError = new Error('Incorrect email or password')
        fakeError.statusCode = 401

        sinon.stub(authService,'signinService').rejects(fakeError)

        const res = await request(app).post('/api/auth/signin').send(fakeUser)

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Incorrect email or password')
    })
})

describe('POST /api/auth/logout', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return 200 and a success message on successful logout', async () => {

        sinon.stub(authService,'logoutService').resolves()

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(200)
        expect(res.body).to.deep.equal({'Message' : 'Logged Out Successfully'})
    })

    it('should return 401 if authorization header is missing', async () => {

        const logout_service_stub = sinon.stub(authService,'logoutService')

        const res = await request(app).post('/api/auth/logout')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Authorization Token Missing')
        expect(logout_service_stub.called).to.be.false
    })

    it('should return an appropriate error status code and message if logout fails', async () => {

        const fakeError = new Error('Invalid or expired token')
        fakeError.statusCode = 401

        sinon.stub(authService,'logoutService').rejects(fakeError)

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization','Bearer this.is.a.dummy.token')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal('Invalid or expired token')
    })
})