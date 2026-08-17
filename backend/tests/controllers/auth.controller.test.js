import {logoutController, signinController, signupController} from '../../src/controllers/auth.controller.js'
import authService from '../../src/services/auth.service.js'
import {expect} from 'chai'
import sinon from 'sinon'

describe('Signup Controller',() => {

    afterEach(() => {
        sinon.restore()
    })

    it('should successfully create a user and return an access token', async () => {
        
        const fakeUser = {
            name     : 'Umair Raza',
            email    : 'umair.raza@gmail.com',
            password : '123456'
        }

        /* dummy request, response, and next */

        const req = {
            body: fakeUser
        }

        const res = {
            /* status returns the response object itself so json() can be chained */
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const next = sinon.spy()

        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        sinon.stub(authService,'signupService').resolves({
            access_token: 'this.is.a.dummy.access.token',
            user: {
                _id: '507f1f77bcf86cd799439011',
                name: 'Umair Raza',
                email: 'umair.raza@gmail.com'
            }
        })

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(res.status.calledWith(201)).to.be.true
        expect(res.json.calledWith(sinon.match({
            status: 'Signup Successful',
            access_token: 'this.is.a.dummy.access.token',
            user: sinon.match({
                _id: sinon.match.string,
                name: sinon.match.string,
                email: sinon.match.string
            })
        }))).to.be.true
        expect(next.called).to.be.false
    })

     it('should reject signup if field(s) are missing and return a meaningful error message', async () => {
        
        const fakeUser = {
            email    : 'umair.raza@gmail.com',
            password : '123456'
        }
    
        /* dummy request, response, and next */

        const req = {
            body: fakeUser
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const next = sinon.spy()

        /* mock error */
        const fakeError = new Error('All Fields Required')
        fakeError.statusCode = 400   

        /* stubbing service layer */
        sinon.stub(authService,'signupService').rejects(fakeError)      

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('All Fields Required')
    })

    it('should reject signup if field(s) are empty strings and return a meaningful error message', async () => {
        
        const fakeUser = {
            name     : '',
            email    : 'umair.raza@gmail.com',
            password : '123456'
        }
    
        /* dummy request, response, and next */

        const req = {
            body: fakeUser
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const next = sinon.spy()

        /* mock error */
        const fakeError = new Error('All Fields Required')
        fakeError.statusCode = 400   

        /* stubbing service layer */
        sinon.stub(authService,'signupService').rejects(fakeError)      

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('All Fields Required')
    })

    
    it('should reject signup on invalid email pattern and return a meaningful error message', async () => {
        
        const fakeUser = {
            name     : 'Umair Raza',
            email    : 'umair.raza@gmail.com',
            password : '123456'
        }
    
        /* dummy request, response, and next */

        const req = {
            body: fakeUser
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const next = sinon.spy()

        /* mock error */
        const fakeError = new Error('Invalid Email Pattern')
        fakeError.statusCode = 400                      

        /* replacing dependency methods with stubbed methods */
        /* throwing an error inside a function is equivalent to a rejected promise from an async function hence rejects */
        sinon.stub(authService,'signupService').rejects(fakeError)      

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('Invalid Email Pattern')
    })
    
    it('should reject signup on passwords smaller than 8 characters and return a meaningful error message', async () => {
        
        const fakeUser = {
            name     : 'Umair Raza',
            email    : 'umair.raza@gmail.com',
            password : '123456'
        }
    
        /* dummy request, response, and next */

        const req = {
            body: fakeUser
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const next = sinon.spy()

        /* mock error */
        const fakeError = new Error('Password should be at least 8 characters long')
        fakeError.statusCode = 400

        /* replacing service layer */
        sinon.stub(authService,'signupService').rejects(fakeError)      

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(400)
        expect(next.firstCall.args[0].message).to.equal('Password should be at least 8 characters long')
    })

    it('should reject signup on email duplication and return a meaningful error message', async () => {
        
        const fakeUser = {
            name     : 'Umair Raza',
            email    : 'umair.raza@gmail.com',
            password : '123456'
        }
    
        /* dummy request, response, and next */

        const req = {
            body: fakeUser
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        }

        const next = sinon.spy()

        /* mock error */
        const fakeError = new Error('Email Already Exists')
        fakeError.statusCode = 409   

        /* replacing dependency methods with stubbed methods */
        /* throwing an error inside a function is equivalent to a rejected promise from an async function hence rejects */
        sinon.stub(authService,'signupService').rejects(fakeError)      

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(409)
        expect(next.firstCall.args[0].message).to.equal('Email Already Exists')
    })

})

describe('Signin Controller',() => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully sign in existing users and return an access token', async () => {

        /* mock request and response objects */

        const fakeUser = {
            email     : 'umair.raza@gmail.com',
            password  : '123456'          
        }

        const req = {
            body : fakeUser
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        /* stubbing service layer */
        sinon.stub(authService,'signinService').resolves({
            access_token: 'this.is.a.dummy.access.token',
            user: {
                _id: '507f1f77bcf86cd799439011',
                name: 'Umair Raza',
                email: 'umair.raza@gmail.com'
            }
        })


        /* stubbing error middleware */
        const next = sinon.spy()

        await signinController(req,res,next)

        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith(sinon.match({
            status: 'Signin Successful',
            access_token: 'this.is.a.dummy.access.token',
            user: sinon.match({
                _id: sinon.match.string,
                name: sinon.match.string,
                email: sinon.match.string
            })
        }))).to.be.true
        expect(next.called).to.be.false
    })
    
    it('should provide meaningful error message if user email is invalid or not found', async () => {

        /* mock request and response objects */

        const fakeUser = {
            email     : 'umair.raza@gmail.com',
            password  : '123456'          
        }

        const req = {
            body : fakeUser
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        /* mock error */
        const fakeError = new Error('Incorrect email or password')
        fakeError.statusCode = 401

        /* stubbing service layer */
        sinon.stub(authService,'signinService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await signinController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(401)
        expect(next.firstCall.args[0].message).to.equal('Incorrect email or password')
    })

    
    it('should provide meaningful error message if password is incorrect', async () => {

        /* mock request and response objects */

        const fakeUser = {
            email     : 'umair.raza@gmail.com',
            password  : '123456'          
        }

        const req = {
            body : fakeUser
        }

        const res = {
            status : sinon.stub().returnsThis(),
            json   : sinon.stub()
        }

        /* mock error */
        const fakeError = new Error('Incorrect email or password')
        fakeError.statusCode = 401

        /* stubbing service layer */
        sinon.stub(authService,'signinService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await signinController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(401)
        expect(next.firstCall.args[0].message).to.equal('Incorrect email or password')
    })

})

describe('Logout Controller', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return a success message with appropriate status code', async () => {

        /* mock request and response objects */

        const fakeToken = 'this.is.a.dummy.token'
        const req = {
            headers : {
                authorization: `Bearer ${fakeToken}`
            }
        }
        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        const next = sinon.spy()

        /* stubbing logout service */
        const logout_service_stub = sinon.stub(authService,'logoutService')

        await logoutController(req,res,next)

        expect(logout_service_stub.calledOnce).to.be.true
        expect(logout_service_stub.firstCall.args[0]).to.equal(fakeToken)
        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith({'Message' : 'Logged Out Successfully'})).to.be.true
        expect(next.called).to.be.false
    })
    
    it('should return return an appropriate error if authorization header is not found', async () => {

        /* mock request and response objects */

        /* empty request header */
        const req = {
            headers : {}
        }
        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }

        const next = sinon.spy()

        /* stubbing logout service */
        const logout_service_stub = sinon.stub(authService,'logoutService')

        await logoutController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(401)
        expect(next.firstCall.args[0].message).to.equal('Authorization Token Missing')
        expect(logout_service_stub.called).to.be.false
    })

})