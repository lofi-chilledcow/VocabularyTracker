import { useEffect, useState, useRef } from 'react'
import { Search } from 'lucide-react'
import client from '../api/client'
import type { FilterState, SortOption } from '../types'

interface Props {
  value: FilterState
  onChange: (f: FilterState) => void
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'By Date', value: 'date' },
  { label: 'A–Z', value: 'alpha' },
  { label: 'By Category', value: 'category' },
]

export default function SortBar({ value, onChange }: Props) {
  const [categories, setCategories] = useState<string[]>([])
  const [inputVal, setInputVal] = useState(value.q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    client.get<{ category: string }[]>('/api/categories')
      .then(res => setCategories(res.data.map(c => c.category)))
      .catch(() => {})
  }, [])

  function handleSearch(q: string) {
    setInputVal(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange({ ...value, q }), 300)
  }

  function handleSort(sort: SortOption) {
    onChange({ ...value, sort })
  }

  function handleCategory(category: string) {
    onChange({ ...value, category })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort buttons */}
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`px-3 py-1.5 text-sm transition-colors ${
              value.sort === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={inputVal}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search words…"
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <select
          value={value.category}
          onChange={e => handleCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 bg-white"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}
    </div>
  )
}
