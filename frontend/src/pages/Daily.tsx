import { useState, useEffect } from 'react'
import { format, subDays, addDays, isToday, isFuture, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import client from '../api/client'
import WordCard from '../components/WordCard'
import type { Word, DailyGroup } from '../types'

const STRIP_DAYS = 14

function toDateStr(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export default function Daily() {
  const [current, setCurrent] = useState<Date>(new Date())
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [strip, setStrip] = useState<DailyGroup[]>([])

  // Fetch strip once on mount
  useEffect(() => {
    client.get<DailyGroup[]>('/api/daily')
      .then(res => setStrip(res.data))
      .catch(() => {})
  }, [])

  // Fetch words whenever current date changes
  useEffect(() => {
    setLoading(true)
    client.get<Word[]>('/api/daily', { params: { date: toDateStr(current) } })
      .then(res => setWords(res.data))
      .catch(() => setWords([]))
      .finally(() => setLoading(false))
  }, [current])

  function goBack()    { setCurrent(d => subDays(d, 1)) }
  function goForward() { if (!isToday(current)) setCurrent(d => addDays(d, 1)) }

  // Build last-14-days strip (always show, merge with API data)
  const stripDays = Array.from({ length: STRIP_DAYS }, (_, i) => {
    const d = subDays(new Date(), STRIP_DAYS - 1 - i)
    const dateStr = toDateStr(d)
    const group = strip.find(g => g.date === dateStr)
    return { date: d, dateStr, count: group?.count ?? 0 }
  })

  const currentStr = toDateStr(current)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* 14-day strip */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {stripDays.map(({ date, dateStr, count }) => {
            const active = dateStr === currentStr
            return (
              <button
                key={dateStr}
                onClick={() => setCurrent(date)}
                className={`flex flex-col items-center min-w-[44px] px-2 py-2 rounded-lg text-xs transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >
                <span className="font-medium">{format(date, 'EEE')}</span>
                <span className={active ? 'text-blue-100' : 'text-gray-400'}>{format(date, 'd')}</span>
                <span className={`mt-1 font-bold ${count > 0 ? (active ? 'text-white' : 'text-blue-600') : 'opacity-30'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              {isToday(current) ? 'Today' : format(current, 'EEEE, MMMM d')}
            </p>
            {!isToday(current) && (
              <p className="text-sm text-gray-400">{format(current, 'yyyy')}</p>
            )}
          </div>

          <button
            onClick={goForward}
            disabled={isToday(current)}
            className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Header */}
        {!loading && (
          <p className="text-sm text-gray-500">
            {words.length > 0
              ? `${words.length} word${words.length !== 1 ? 's' : ''} learned on ${format(current, 'MMM d, yyyy')}`
              : null}
          </p>
        )}

        {/* Word list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <span className="text-5xl">📭</span>
            <p className="text-lg font-medium">No words added this day</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {words.map(w => (
              <WordCard
                key={w.id}
                word={w}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
