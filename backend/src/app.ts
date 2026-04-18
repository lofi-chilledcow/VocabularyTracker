import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import wordsRouter from './routes/words'
import categoriesRouter from './routes/categories'
import dailyRouter from './routes/daily'
import statsRouter from './routes/stats'

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'VocabularyTracker API is running' })
})

app.use('/api/words', wordsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/daily', dailyRouter)
app.use('/api/stats', statsRouter)

app.use(errorHandler)

export default app
