/* separating app.js and server.js for unit testing */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import noteRoutes from './routes/notes.routes.js'
import healthRoute from './routes/health.routes.js'
import logger from './configs/logger.js'
import pinoHttp from 'pino-http'
import { errorMiddleware } from './middleware/error.middleware.js'

dotenv.config()

// extracting env variables
const PORT = process.env.PORT

// creating an express app
const app = express()

// mounting middleware
app.use(cors())
app.use(express.json())
app.use(pinoHttp({logger}))

// mounting routes
app.use('/api/auth',authRoutes)
app.use('/api/notes',noteRoutes)
app.use('/api',healthRoute)

// adding error middleware at the end
app.use(errorMiddleware)

export default app