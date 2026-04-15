import { useState, useCallback } from 'react'
import client from '../api/client'
import { Stats } from '../types'

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await client.get<Stats>('/api/stats')
      setStats(res.data)
    } catch {
      // silently fail — StatsBar handles its own initial fetch
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, refetch }
}
