import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './configs/db.js'

await connectDB()

app.listen(3000,() => 
{
    console.log('Server listening at port 3000')
})