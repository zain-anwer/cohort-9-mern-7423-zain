import mongoose from 'mongoose'

const notesSchema = new mongoose.Schema(
    {
        user_id:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title:
        {
            type: String,
            required: true
        },
        content:
        {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('Note',notesSchema)