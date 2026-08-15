import mongoose from 'mongoose'


const revokedTokenSchema = mongoose.Schema(
    {
        jti: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    }
)

/* index on expiresAt and delete after that time is reached */

revokedTokenSchema.index(
    {expiresAt: 1},
    {expireAfterSeconds: 0}
)

export default mongoose.model('RevokedToken',revokedTokenSchema)