import authService from '../../src/services/auth.service.js'
import usersModel from '../../src/models/users.model.js'
import {expect} from 'chai'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import sinon from 'sinon'
import tokenModel from '../../src/models/token.model.js'

describe('Signup Service',() => {

    afterEach(() => {
        sinon.restore()
    })

    it('should successfully create a user and return an access token', async () => {
        
        const name     = 'Umair Raza'
        const email    = 'umair.raza@gmail.com'
        const password = '12345678'  

        const fakeCreationResult = {
            _id: '507f1f77bcf86cd799439011',
            name: name,
            email: email,
            password: password,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        sinon.stub(usersModel,'create').resolves(fakeCreationResult)
        sinon.stub(usersModel,'findOne').resolves(null)
        sinon.stub(jwt,'sign').returns('this.is.a.dummy.access.token')
        sinon.stub(bcrypt,'hash').resolves('this.is.a.dummy.hash')        

        /* calling service method with dummy data */
        const result = await authService.signupService(name,email,password)

        /* assertions */
        expect(result.access_token).to.equal('this.is.a.dummy.access.token')
        expect(result.user).to.deep.equal({
            _id: '507f1f77bcf86cd799439011',
            name: name,
            email: email
        })
    })

    it('should reject signup if fields are missing and throw a meaningful error', async () => {
        
        const name     = undefined
        const email    = 'umair.raza@gmail.com'
        const password = '12345678'

        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        const db_call = sinon.stub(usersModel,'findOne')
        const token_generation_stub = sinon.stub(jwt,'sign')
        const hash_stub = sinon.stub(bcrypt,'hash')      

        /* error result */
        var thrownError = null

        /* calling signup service with dummy data */
        try {
            await authService.signupService(name,email,password)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(400)
        expect(thrownError.message).to.equal('All Fields Required')
        expect(db_call.called).to.be.false
        expect(hash_stub.called).to.be.false                                // to check whether thrown error terminated workflow
        expect(token_generation_stub.called).to.be.false
    })

    it('should reject signup if fields are empty strings and throw a meaningful error', async () => {
        
        const name     = ''
        const email    = 'umair.raza@gmail.com'
        const password = '12345678'

        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        const db_call = sinon.stub(usersModel,'findOne')
        const token_generation_stub = sinon.stub(jwt,'sign')
        const hash_stub = sinon.stub(bcrypt,'hash')      

        /* error result */
        var thrownError = null

        /* calling signup service with dummy data */
        try {
            await authService.signupService(name,email,password)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(400)
        expect(thrownError.message).to.equal('All Fields Required')
        expect(db_call.called).to.be.false
        expect(hash_stub.called).to.be.false                                // to check whether thrown error terminated workflow
        expect(token_generation_stub.called).to.be.false
    })

    it('should reject signup if password length is less than 8 and return a meaningful error', async () => {
        
        const name     = 'Umair Raza'
        const email    = 'umair.raza@gmail.com'
        const password = '12345'

        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        const db_call = sinon.stub(usersModel,'findOne')
        const token_generation_stub = sinon.stub(jwt,'sign')
        const hash_stub = sinon.stub(bcrypt,'hash')      

        /* error result */
        var thrownError = null

        /* calling signup service with dummy data */
        try {
            await authService.signupService(name,email,password)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(400)
        expect(thrownError.message).to.equal('Password should be at least 8 characters long')
        expect(hash_stub.called).to.be.false                              
        expect(token_generation_stub.called).to.be.false
        expect(db_call.called).to.be.false
    })
    
    it('should reject signup on email pattern mismatch and return a meaningful error', async () => {
        
        const name     = 'Umair Raza'
        const email    = 'umair.razagmail.com'
        const password = '12345678'

        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        const db_call = sinon.stub(usersModel,'findOne')
        const token_generation_stub = sinon.stub(jwt,'sign')
        const hash_stub = sinon.stub(bcrypt,'hash')      

        /* error result */
        var thrownError = null

        /* calling signup service with dummy data */
        try {
            await authService.signupService(name,email,password)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(400)
        expect(thrownError.message).to.equal('Invalid Email Pattern')
        expect(hash_stub.called).to.be.false                                // to check whether thrown error terminated workflow
        expect(token_generation_stub.called).to.be.false
        expect(db_call.called).to.be.false
    })

    it('should reject signup on email duplication and return a meaningful error', async () => {
        
        const name     = 'Umair Raza'
        const email    = 'umair.raza@gmail.com'
        const password = '12345678'
        
        const existingUser = {
            _id: '507f1f77bcf86cd799439011',
            name: name,
            email: email,
            password: 'this.is.a.dummy.hash',
            createdAt: new Date(),
            updatedAt: new Date()
        }


        /* replacing dependency methods with stubbed methods */
        /* resolves is used for asynchronous methods and returns is used for synchronous ones */
        sinon.stub(usersModel,'findOne').resolves(existingUser)
        const token_generation_stub = sinon.stub(jwt,'sign')
        const hash_stub = sinon.stub(bcrypt,'hash')      

        /* error result */
        var thrownError = null

        /* calling signup service with dummy data */
        try {
            await authService.signupService(name,email,password)
        }
        catch(err) {
            thrownError = err
        }

        /* assertions */
        expect(thrownError.statusCode).to.equal(409)
        expect(thrownError.message).to.equal('Email Already Exists')
        expect(hash_stub.called).to.be.false                                // to check whether thrown error terminated workflow
        expect(token_generation_stub.called).to.be.false
    })

})

describe('Signin Service',() => {
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully sign in existing users and return an access token', async () => {

        /* mocking service parameters */
        
        const name = 'Umair Raza'
        const email = 'umair.raza@gmail.com'
        const password = '12345678'          

        const userFound = {
            _id : '507f1f77bcf86cd799439011',
            name: 'Umair Raza',
            email: 'umair.raza@gmail.com',
            password: '12345678', 
            createdAt : new Date(),
            updatedAt : new Date()
        }

        /* stubbing mongoose and dependency methods */
        sinon.stub(usersModel,'findOne').resolves(userFound)
        sinon.stub(jwt,'sign').returns('this.is.a.dummy.access.token')
        sinon.stub(bcrypt,'compare').resolves(true)
        
        const result = await authService.signinService(email,password)
        
        expect(result.access_token).to.equal('this.is.a.dummy.access.token')
        expect(result.user).to.deep.equal({
            _id: '507f1f77bcf86cd799439011',
            name: name,
            email: email
        })
    })
    
    it('should provide meaningful error message if user email is invalid or not found', async () => {

        /* mocking details */

        const email = 'umair.raza@gmail.com'
        const password = '12345678'          

        /* stubbing mongoose and dependency methods */
        sinon.stub(usersModel,'findOne').resolves(null)
        const compare_stub = sinon.stub(bcrypt,'compare')
        const token_generation_stub = sinon.stub(jwt,'sign')

        var thrownError = null

        try {
            await authService.signinService(email,password)
        }
        catch(err) {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(401)
        expect(thrownError.message).to.equal('Incorrect email or password')
        expect(compare_stub.called).to.be.false
        expect(token_generation_stub.called).to.be.false 
    })

    it('should provide meaningful error message if password is incorrect', async () => {

        const email = 'umair.raza@gmail.com'
        const password = '123456'         

        const userFound = {
            _id : '507f1f77bcf86cd799439011',
            name: 'Umair Raza',
            email: 'umair.raza@gmail.com',
            password : '654321',
            createdAt : new Date(),
            updatedAt : new Date()
        }

        /* stubbing mongoose and dependency methods */
        sinon.stub(usersModel,'findOne').resolves(userFound)
        const compare_stub = sinon.stub(bcrypt,'compare').resolves(false)
        const token_generation_stub = sinon.stub(jwt,'sign')

        var thrownError = null

        try {
            await authService.signinService(email,password)
        }
        catch(err)
        {
            thrownError = err
        }

        expect(thrownError.statusCode).to.equal(401)
        expect(thrownError.message).to.equal('Incorrect email or password')
        expect(compare_stub.calledOnce).to.be.true
        expect(token_generation_stub.called).to.be.false
    })

})

describe('Logout Service',() => { 
    
    afterEach(() => {
        sinon.restore()
    })

    it('should successfully write revoked token in database', async () => {

        /* mock tokens */
        const token = 'this.is.a.dummy.token'
        const decoded = {
            userId: 'mock_id',
            jti   : 'mock_id',
            exp   : 12345
        }      

        /* stubbing methods */
        sinon.stub(jwt,'verify').returns(decoded)
        const db_call_stub = sinon.stub(tokenModel,'updateOne').resolves()
        
        await authService.logoutService(token)

        /* assertions */
        expect(db_call_stub.calledOnce).to.be.true
    })

    
    it('should throw error write on invalid or expired token', async () => {

        /* mock token */
        const token = 'this.is.an.expired.token'

        /* stubbing methods */
        sinon.stub(jwt,'verify').throws(new Error('Generic Error'))
        const db_call_stub = sinon.stub(tokenModel,'updateOne')
        
        let error = null
        try {
            await authService.logoutService(token)
        }
        catch(err)
        {
            error = err
        }

        /* assertions */
        expect(error.statusCode).to.equal(401)
        expect(error.message).to.equal('Invalid or expired token')
        expect(db_call_stub.called).to.be.false
    })
})
 