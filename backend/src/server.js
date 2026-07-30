import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './configs/db.js'

dotenv.config()

PORT = process.env.PORT

try {
    await connectDB()
    app.listen(PORT,() => { console.log('Server listening at port 3000') })
}
catch(err)
{
    console.log('Error in setting up database or accessing PORT number')
    /* process.exit(code) if code 0 successful execution if 1 abnormal termination */
    process.exit(1)
}