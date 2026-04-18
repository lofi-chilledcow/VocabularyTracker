import request from 'supertest'
import app from '../src/app'
import db from '../src/db/database'

beforeEach(() => {
  db.exec('DELETE FROM words')
})

describe('GET /api/stats', () => {
  it('returns correct totalWords', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived' })
    await request(app).post('/api/words').send({ word: 'Eloquent', meaning: 'Persuasive' })
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.body.totalWords).toBe(2)
  })

  it('returns correct totalCategories', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived', category: 'Adjective' })
    await request(app).post('/api/words').send({ word: 'Serendipity', meaning: 'Happy accident', category: 'Noun' })
    await request(app).post('/api/words').send({ word: 'Eloquent', meaning: 'Persuasive', category: 'Adjective' })
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.body.totalCategories).toBe(2)
  })

  it('returns correct wordsToday', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived' })
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.body.wordsToday).toBe(1)
  })

  it('streakDays is a number', async () => {
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(typeof res.body.streakDays).toBe('number')
  })
})
