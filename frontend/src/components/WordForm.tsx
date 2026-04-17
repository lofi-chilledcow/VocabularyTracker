import { useState, useEffect } from 'react'
import type { SubmitEvent } from 'react'
import client from '../api/client'
import TagInput from './TagInput'
import type { WordFormData } from '../types'

interface Props {
  initialValues?: Partial<WordFormData>
  onSubmit: (data: WordFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const empty: WordFormData = {
  word: '',
  meaning: '',
  sentence: '',
  category: '',
  acronym: '',
  synonyms: [],
}

export default function WordForm({ initialValues, onSubmit, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<WordFormData>({ ...empty, ...initialValues })
  const [errors, setErrors] = useState<{ word?: string; meaning?: string }>({})
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    client.get<{ category: string }[]>('/api/categories')
      .then(res => setCategories(res.data.map(c => c.category)))
      .catch(() => {})
  }, [])

  function set(field: keyof WordFormData, value: string | string[]) {
    setForm(f => ({ ...f, [field]: value }))
    if (field === 'word' || field === 'meaning') {
      setErrors(e => ({ ...e, [field]: undefined }))
    }
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!form.word.trim())    errs.word    = 'Word is required'
    if (!form.meaning.trim()) errs.meaning = 'Meaning is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Word */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Word <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.word}
          onChange={e => set('word', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.word ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="e.g. Ephemeral"
        />
        {errors.word && <p className="text-xs text-red-500 mt-1">{errors.word}</p>}
      </div>

      {/* Meaning */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meaning <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.meaning}
          onChange={e => set('meaning', e.target.value)}
          rows={2}
          className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.meaning ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Definition…"
        />
        {errors.meaning && <p className="text-xs text-red-500 mt-1">{errors.meaning}</p>}
      </div>

      {/* Sentence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Example sentence</label>
        <textarea
          value={form.sentence ?? ''}
          onChange={e => set('sentence', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Use it in a sentence…"
        />
      </div>

      {/* Category + Acronym */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            list="categories-list"
            value={form.category ?? ''}
            onChange={e => set('category', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Noun"
          />
          <datalist id="categories-list">
            {categories.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Acronym</label>
          <input
            type="text"
            value={form.acronym ?? ''}
            onChange={e => set('acronym', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. RSVP"
          />
        </div>
      </div>

      {/* Synonyms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Synonyms</label>
        <TagInput
          value={form.synonyms ?? []}
          onChange={tags => set('synonyms', tags)}
        />
        <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {isLoading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
