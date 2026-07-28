import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async() => 
{
    try 
    {
        await mongoose.connect(process.env.MONGODB_URI)   
        console.log('Database Connection Successful')
    }
    catch(err)
    {
        console.log('Error: ',err)
    }
}

export default connectDB