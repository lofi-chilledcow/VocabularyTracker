import request from 'supertest'
import app from '../src/app'
import db from '../src/db/database'

beforeEach(() => {
  db.exec('DELETE FROM words')
})

const today = new Date().toISOString().slice(0, 10)

describe('GET /api/daily', () => {
  it('returns last 30 days grouped by date', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived' })
    const res = await request(app).get('/api/daily')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('date')
    expect(res.body[0]).toHaveProperty('count')
    expect(res.body[0]).toHaveProperty('words')
  })

  it('returns words for a specific date', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived' })
    const res = await request(app).get(`/api/daily?date=${today}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].word).toBe('Ephemeral')
  })

  it('returns empty array if no words on that date', async () => {
    const res = await request(app).get('/api/daily?date=2000-01-01')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})
