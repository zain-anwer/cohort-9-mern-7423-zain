import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './configs/db.js'
dotenv.config()

let PORT

try {
    await connectDB()
    PORT = process.env.PORT
}
catch(err)
{
    console.log('Error in setting up database or accessing PORT number')
    /* process.exit(code) if code 0 successful execution if 1 abnormal termination */
    process.exit(1)
}

const server = app.listen(PORT,() => { console.log(`Server listening at port ${PORT}`) })

server.on('error', (err) => {
    if (err.code == 'EADDRINUSE')
        console.log(`PORT:${PORT} already in use`)
    else
        console.log(`Server failed to start: ${err}`)
    process.exit(1)
})