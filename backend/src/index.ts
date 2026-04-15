import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import wordsRouter from './routes/words'
import categoriesRouter from './routes/categories'
import dailyRouter from './routes/daily'
import statsRouter from './routes/stats'

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VocabularyTracker API is running' })
})

app.use('/api/words', wordsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/daily', dailyRouter)
app.use('/api/stats', statsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
