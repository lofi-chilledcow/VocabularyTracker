import request from 'supertest'
import app from '../src/app'
import db from '../src/db/database'

beforeEach(() => {
  db.exec('DELETE FROM words')
})

describe('GET /api/categories', () => {
  it('returns categories with count', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived', category: 'Adjective' })
    await request(app).post('/api/words').send({ word: 'Eloquent', meaning: 'Persuasive', category: 'Adjective' })
    await request(app).post('/api/words').send({ word: 'Serendipity', meaning: 'Happy accident', category: 'Noun' })

    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)

    const adjective = res.body.find((c: any) => c.category === 'Adjective')
    const noun = res.body.find((c: any) => c.category === 'Noun')
    expect(adjective.count).toBe(2)
    expect(noun.count).toBe(1)
  })

  it('returns empty array if no categories', async () => {
    await request(app).post('/api/words').send({ word: 'Ephemeral', meaning: 'Short-lived' })
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})
