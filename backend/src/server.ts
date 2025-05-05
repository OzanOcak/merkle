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
  'app://.' // Electron production (if using app protocol)
  //'file://*' // For file:// URLs in production
]

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
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
    console.log(`Markle@2025 API running`)
  })
})

export default app
