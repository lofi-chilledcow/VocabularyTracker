import { useEffect, useState } from 'react'
import client from '../api/client'
import type { Stats } from '../types'

function StatCard({ label, value, loading }: { label: string; value: string | number; loading: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
      {loading ? (
        <>
          <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
        </>
      ) : (
        <>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">{label}</span>
        </>
      )}
    </div>
  )
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get<Stats>('/api/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total words"  value={stats?.totalWords  ?? 0} loading={loading} />
      <StatCard label="Added today"  value={stats?.wordsToday  ?? 0} loading={loading} />
      <StatCard label="This week"    value={stats?.wordsThisWeek ?? 0} loading={loading} />
      <StatCard label={`Streak 🔥`} value={stats ? `${stats.streakDays}d` : '0d'} loading={loading} />
    </div>
  )
}
