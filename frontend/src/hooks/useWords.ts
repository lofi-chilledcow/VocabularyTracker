import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'
import type { Word, FilterState, WordFormData } from '../types'

const DEFAULT_FILTER: FilterState = { sort: 'date', q: '', category: '' }

export function useWords() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  const fetchWords = useCallback(async (f: FilterState = filter) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = { sort: f.sort }
      if (f.q)        params.q        = f.q
      if (f.category) params.category = f.category
      const res = await client.get<Word[]>('/api/words', { params })
      setWords(res.data)
    } catch {
      setError('Failed to load words')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchWords(filter) }, [filter])

  async function createWord(data: WordFormData): Promise<Word> {
    const created_at = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const res = await client.post<Word>('/api/words', { ...data, created_at })
    return res.data
  }

  async function updateWord(id: string, data: WordFormData): Promise<Word> {
    const res = await client.put<Word>(`/api/words/${id}`, data)
    return res.data
  }

  async function deleteWord(id: string): Promise<void> {
    await client.delete(`/api/words/${id}`)
  }

  return {
    words,
    loading,
    error,
    filter,
    setFilter,
    refetch: () => fetchWords(filter),
    createWord,
    updateWord,
    deleteWord,
  }
}
