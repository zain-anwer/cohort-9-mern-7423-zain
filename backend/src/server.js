import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './configs/db.js'
dotenv.config()

try {
    await connectDB()
    const PORT = process.env.PORT
    app.listen(PORT,() => { console.log(`Server listening at port ${PORT}`) })
}
catch(err)
{
    console.log('Error in setting up database or accessing PORT number')
    /* process.exit(code) if code 0 successful execution if 1 abnormal termination */
    process.exit(1)
}