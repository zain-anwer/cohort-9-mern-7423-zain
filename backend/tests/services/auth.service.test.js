// import {logoutController, signinController, signupController} from '../../src/controllers/auth.controller.js'
// import usersModel from '../../src/models/users.model.js'
// import {expect} from 'chai'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcrypt'
// import sinon from 'sinon'

// describe('Signup Controller',() => {

//     afterEach(() => {
//         sinon.restore()
//     })

//     it('should successfully create a user and return an access token', async () => {
        
//         const fakeUser = {
//             name     : 'Umair Raza',
//             email    : 'umair.raza@gmail.com',
//             password : '123456'
//         }

//         const fakeCreationResult = {
//             _id: '507f1f77bcf86cd799439011',
//             ...fakeUser,
//             createdAt: new Date(),
//             updatedAt: new Date()
//         }
    
//         /* dummy request, response, and next */

//         const req = {
//             body: fakeUser
//         }

//         const res = {
//             /* status returns the response object itself so json() can be chained */
//             status: sinon.stub().returnsThis(),
//             json: sinon.stub()
//         }

//         const next = sinon.spy()

//         /* replacing dependency methods with stubbed methods */
//         /* resolves is used for asynchronous methods and returns is used for synchronous ones */
//         sinon.stub(usersModel,'create').resolves(fakeCreationResult)
//         sinon.stub(usersModel,'findOne').resolves(null)
//         sinon.stub(jwt,'sign').returns('this.is.a.dummy.access.token')
//         sinon.stub(bcrypt,'hash').resolves('this.is.a.dummy.hash')        

//         /* calling controller method with dummy data */
//         await signupController(req,res,next)

//         /* assertions */
//         expect(res.status.calledWith(201)).to.be.true
//         expect(res.json.calledWith(sinon.match({
//             status: 'SignUp Successful',
//             access_token: sinon.match.string
//         }))).to.be.true
//         expect(next.called).to.be.false
//     })

//     it('should reject signup on email duplication and return a meaningful error', async () => {
        
//         const fakeUser = {
//             name     : 'Umair Raza',
//             email    : 'umair.raza@gmail.com',
//             password : '123456'
//         }

//         const existingUser = {
//             _id: '507f1f77bcf86cd799439011',
//             ...fakeUser,
//             createdAt: new Date(),
//             updatedAt: new Date()
//         }
    
//         /* dummy request, response, and next */

//         const req = {
//             body: fakeUser
//         }

//         const res = {
//             status: sinon.stub().returnsThis(),
//             json: sinon.stub()
//         }

//         const next = sinon.spy()

//         /* replacing dependency methods with stubbed methods */
//         /* resolves is used for asynchronous methods and returns is used for synchronous ones */
//         sinon.stub(usersModel,'findOne').resolves(existingUser)
//         const hash_stub = sinon.stub(bcrypt,'hash')      

//         /* calling controller method with dummy data */
//         await signupController(req,res,next)

//         /* assertions */
//         expect(next.calledOnce).to.be.true
//         expect(next.firstCall.args[0].statusCode).to.equal(409)
//         expect(next.firstCall.args[0].message).to.equal('Email Already Exists')
//         expect(hash_stub.called).to.be.false  // to check whether middleware call terminated workflow
//     })

// })

// describe('Signin Controller',() => {
    
//     afterEach(() => {
//         sinon.restore()
//     })

//     it('should successfully sign in existing users and return an access token', async () => {

//         /* mock request and response objects */

//         const fakeUser = {
//             email     : 'umair.raza@gmail.com',
//             password  : '123456'          
//         }

//         const req = {
//             body : fakeUser
//         }

//         const res = {
//             status : sinon.stub().returnsThis(),
//             json   : sinon.stub()
//         }

//         const userFound = {
//             _id : '507f1f77bcf86cd799439011',
//             ...fakeUser,
//             createdAt : new Date(),
//             updatedAt : new Date()
//         }

//         /* stubbing mongoose and dependency methods */
//         sinon.stub(usersModel,'findOne').resolves(userFound)
//         sinon.stub(jwt,'sign').returns('this.is.a.dummy.access.token')
//         sinon.stub(bcrypt,'compare').resolves(true)

//         /* stubbing error middleware */
//         const next = sinon.spy()

//         await signinController(req,res,next)

//         expect(res.status.calledWith(200)).to.be.true
//         expect(res.json.calledWith(sinon.match({
//             status: 'Signin Successful',
//             access_token: sinon.match.string
//         }))).to.be.true
//         expect(next.called).to.be.false
//     })
    
//     it('should provide meaningful error message if user email is invalid or not found', async () => {

//         /* mock request and response objects */

//         const fakeUser = {
//             email     : 'umair.raza@gmail.com',
//             password  : '123456'          
//         }

//         const req = {
//             body : fakeUser
//         }

//         const res = {
//             status : sinon.stub().returnsThis(),
//             json   : sinon.stub()
//         }

//         /* stubbing mongoose and dependency methods */
//         sinon.stub(usersModel,'findOne').resolves(null)
//         const compare_stub = sinon.stub(bcrypt,'compare')

//         /* stubbing error middleware */
//         const next = sinon.spy()

//         await signinController(req,res,next)

//         expect(next.calledOnce).to.be.true
//         expect(next.firstCall.args[0].statusCode).to.equal(401)
//         expect(next.firstCall.args[0].message).to.equal('Incorrect Email')
//         expect(compare_stub.called).to.be.false
//     })

    
//     it('should provide meaningful error message if password is incorrect', async () => {

//         /* mock request and response objects */

//         const fakeUser = {
//             email     : 'umair.raza@gmail.com',
//             password  : '123456'          
//         }

//         const req = {
//             body : fakeUser
//         }

//         const res = {
//             status : sinon.stub().returnsThis(),
//             json   : sinon.stub()
//         }

//         const userFound = {
//             _id : '507f1f77bcf86cd799439011',
//             ...fakeUser,
//             password : '654321',
//             createdAt : new Date(),
//             updatedAt : new Date()
//         }

//         /* stubbing mongoose and dependency methods */
//         sinon.stub(usersModel,'findOne').resolves(userFound)
//         sinon.stub(bcrypt,'compare').resolves(false)
//         const token_generation_stub = sinon.stub(jwt,'sign')

//         /* stubbing error middleware */
//         const next = sinon.spy()

//         await signinController(req,res,next)

//         expect(next.calledOnce).to.be.true
//         expect(next.firstCall.args[0].statusCode).to.equal(401)
//         expect(next.firstCall.args[0].message).to.equal('Incorrect Password')
//         expect(token_generation_stub.called).to.be.false
//     })

// })

// describe('Logout Controller', () => {

//     it('should return a success message with appropriate status code', async () => {

//         /* mock request and response objects */

//         /* empty response header for now before redis implementation */
//         const req = {}
//         const res = {
//             status: sinon.stub().returnsThis(),
//             json  : sinon.stub()
//         }
//         const next = sinon.spy()

//         await logoutController(req,res,next)

//         expect(res.status.calledWith(200)).to.be.true
//         expect(res.json.calledWith({'Message' : 'Logged Out Successfully'})).to.be.true
//         expect(next.called).to.be.false
//     })
// })