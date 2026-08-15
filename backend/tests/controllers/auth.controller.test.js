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
        sinon.stub(authService,'signupService').resolves('this.is.a.dummy.access.token')

        /* calling controller method with dummy data */
        await signupController(req,res,next)

        /* assertions */
        expect(res.status.calledWith(201)).to.be.true
        expect(res.json.calledWith(sinon.match({
            status: 'Signup Successful',
            access_token: sinon.match.string
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
        sinon.stub(authService,'signinService').resolves('this.is.a.dummy.token')

        /* stubbing error middleware */
        const next = sinon.spy()

        await signinController(req,res,next)

        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith(sinon.match({
            status: 'Signin Successful',
            access_token: sinon.match.string
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
        const fakeError = new Error('Incorrect / Unregistered Email')
        fakeError.statusCode = 401

        /* stubbing service layer */
        sinon.stub(authService,'signinService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await signinController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(401)
        expect(next.firstCall.args[0].message).to.equal('Incorrect / Unregistered Email')
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
        const fakeError = new Error('Incorrect Password')
        fakeError.statusCode = 401

        /* stubbing service layer */
        sinon.stub(authService,'signinService').rejects(fakeError)

        /* stubbing error middleware */
        const next = sinon.spy()

        await signinController(req,res,next)

        expect(next.calledOnce).to.be.true
        expect(next.firstCall.args[0].statusCode).to.equal(401)
        expect(next.firstCall.args[0].message).to.equal('Incorrect Password')
    })

})

describe('Logout Controller', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('should return a success message with appropriate status code', async () => {

        /* mock request and response objects */

        /* empty response header for now before redis implementation */
        const req = {}
        const res = {
            status: sinon.stub().returnsThis(),
            json  : sinon.stub()
        }
        const next = sinon.spy()

        await logoutController(req,res,next)

        expect(res.status.calledWith(200)).to.be.true
        expect(res.json.calledWith({'Message' : 'Logged Out Successfully'})).to.be.true
        expect(next.called).to.be.false
    })
})