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
        },
        is_pinned: 
        {
            type: Boolean,
            default: false
        },
        is_binned: {
            type: Boolean,
            default: false
        },
        is_archived: {
            type: Boolean,
            default: false
        },
        pinned_at: {
            type: Date,
            default: null
        },
        binned_at: {
            type: Date,
            default: null
        },
        archived_at: {
            type: Date,
            default: null
        },
        version: {
            type: Number,
            default: 1 
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('Note',notesSchema)