import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import toursRouter from './routes/tours'
import activitiesRouter from './routes/activities'
import athletesRouter from './routes/athletes'
import authRouter from './routes/auth'

const app = express()

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)

    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true)
    }

    // Allow configured origin
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
    if (origin === allowedOrigin) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/tours', toursRouter)
app.use('/api/activities', activitiesRouter)
app.use('/api/athletes', athletesRouter)
app.use('/api/auth', authRouter)

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})

export default app
