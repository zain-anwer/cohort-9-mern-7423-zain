import express from 'express'

const router = express.Router()

router.get('/health',(req,res) => 
    {
        console.log('Log: Health Endpoint Reached')
        return res.json({'status':'ok'})
    }
)

export default router