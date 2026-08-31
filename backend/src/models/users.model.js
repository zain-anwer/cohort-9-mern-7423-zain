import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true
        },
        profile_picture: {
            type: String,
            default: null
        },
        public_id: {
            type: String,
            default: null
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        },
        password:
        {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('User',usersSchema)