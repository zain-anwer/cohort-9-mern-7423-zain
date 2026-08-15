import request from 'supertest'
import {expect} from 'chai'
import app from '../../src/app.js'

describe('GET /api/health', () =>
{
    it('should return status 200', async ()=> 
    {
        try {
            const res = await request(app).get('/api/health')
            expect(res.status).to.equal(200)
        }
        catch(err) {
            fail('Request Failed: ',err)
        }
    })

    it('should return JSON object {status: "ok"}',async () => 
    {
        try {
            const res = await request(app).get('/api/health')
            expect(res.body).to.deep.equal({status: 'ok'})
        }
        catch(err) {
            fail('Request Failed: ',err)
        }
    })
    
})