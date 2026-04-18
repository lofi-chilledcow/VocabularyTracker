import request from 'supertest'
import app from '../src/app'
import db from '../src/db/database'

beforeEach(() => {
  db.exec('DELETE FROM words')
})

const base = { word: 'Ephemeral', meaning: 'Lasting a very short time' }

describe('POST /api/words', () => {
  it('returns 201 with word and synonyms', async () => {
    const res = await request(app)
      .post('/api/words')
      .send({ ...base, synonyms: ['fleeting', 'transient'] })

    expect(res.status).toBe(201)
    expect(res.body.word).toBe('Ephemeral')
    expect(res.body.meaning).toBe('Lasting a very short time')
    expect(res.body.synonyms).toEqual(expect.arrayContaining(['fleeting', 'transient']))
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 if word is missing', async () => {
    const res = await request(app).post('/api/words').send({ meaning: 'test' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 if meaning is missing', async () => {
    const res = await request(app).post('/api/words').send({ word: 'test' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 409 if word already exists', async () => {
    await request(app).post('/api/words').send(base)
    const res = await request(app).post('/api/words').send(base)
    expect(res.status).toBe(409)
    expect(res.body.error).toBeDefined()
  })
})

describe('GET /api/words', () => {
  it('returns array of words', async () => {
    await request(app).post('/api/words').send(base)
    const res = await request(app).get('/api/words')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
  })

  it('returns words sorted alphabetically with sort=alpha', async () => {
    await request(app).post('/api/words').send({ word: 'Zebra', meaning: 'An animal' })
    await request(app).post('/api/words').send({ word: 'Apple', meaning: 'A fruit' })
    const res = await request(app).get('/api/words?sort=alpha')
    expect(res.status).toBe(200)
    expect(res.body[0].word).toBe('Apple')
    expect(res.body[1].word).toBe('Zebra')
  })

  it('returns filtered results with q=search', async () => {
    await request(app).post('/api/words').send({ word: 'Serendipity', meaning: 'Finding good things by chance' })
    await request(app).post('/api/words').send({ word: 'Eloquent', meaning: 'Fluent and persuasive' })
    const res = await request(app).get('/api/words?q=chance')
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].word).toBe('Serendipity')
  })
})

describe('GET /api/words/:id', () => {
  it('returns a single word by id', async () => {
    const created = await request(app).post('/api/words').send(base)
    const res = await request(app).get(`/api/words/${created.body.id}`)
    expect(res.status).toBe(200)
    expect(res.body.word).toBe('Ephemeral')
  })

  it('returns 404 if word not found', async () => {
    const res = await request(app).get('/api/words/nonexistent-id')
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/words/:id', () => {
  it('updates word correctly', async () => {
    const created = await request(app).post('/api/words').send(base)
    const res = await request(app)
      .put(`/api/words/${created.body.id}`)
      .send({ word: 'Ephemeral', meaning: 'Updated meaning', synonyms: ['short-lived'] })
    expect(res.status).toBe(200)
    expect(res.body.meaning).toBe('Updated meaning')
    expect(res.body.synonyms).toContain('short-lived')
  })

  it('returns 404 if word not found', async () => {
    const res = await request(app)
      .put('/api/words/nonexistent-id')
      .send(base)
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/words/:id', () => {
  it('returns 204 no content', async () => {
    const created = await request(app).post('/api/words').send(base)
    const res = await request(app).delete(`/api/words/${created.body.id}`)
    expect(res.status).toBe(204)
  })

  it('returns 404 if word not found', async () => {
    const res = await request(app).delete('/api/words/nonexistent-id')
    expect(res.status).toBe(404)
  })
})
