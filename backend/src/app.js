/* separating app.js and server.js for unit testing */

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import noteRoutes from './routes/notes.routes.js'
import healthRoute from './routes/health.routes.js'
import profileRoutes from './routes/profile.routes.js'
import logger from './configs/logger.js'
import pinoHttp from 'pino-http'
import dotenv from 'dotenv'
import { errorMiddleware } from './middleware/error.middleware.js'

dotenv.config()

// creating an express app
const app = express()

const CLIENT_URL = process.env.CLIENT_URL

if (!CLIENT_URL) {
    throw new Error('CLIENT_URL environment variable is required')
}

// disabling header to prevent backend framework information disclosure (sonarqube says itss baddd)
app.disable('x-powered-by')


// mounting middleware
app.use(cors({
    origin: CLIENT_URL,
    exposedHeaders: ['Content-Disposition'],
}))
app.use(express.json())
app.use(pinoHttp({logger}))

// mounting routes
app.use('/api/auth',authRoutes)
app.use('/api/notes',noteRoutes)
app.use('/api',healthRoute)
app.use('/api/profile',profileRoutes)

// adding error middleware at the end
app.use(errorMiddleware)

export default app