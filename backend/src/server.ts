import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import apiRouter from './routes/api'
import { connectDatabase } from './database'

const app = express()
const port = 3001

// Configure allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Electron renderer
  'http://localhost:5174' // Optional dev frontend
  // Add 'app://*' if using custom protocol in production
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`Blocked by CORS: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400 // Cache CORS preflight for 24h
  })
)

//app.use(cors())
app.use(bodyParser.json())

app.use('/api', apiRouter)

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Markle@2025 API running at http://localhost:${port}`)
  })
})

export default app
