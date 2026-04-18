import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import type { Word } from '../types'

interface Props {
  word: Word
  onEdit: (word: Word) => void
  onDelete: (word: Word) => void
}

export default function WordCard({ word, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-900">{word.word}</h2>
        <div className="flex gap-1 shrink-0">
          {word.category && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
              {word.category}
            </span>
          )}
          {word.antonym && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
              {word.antonym}
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{word.meaning}</p>

      {word.sentence && (
        <p className="text-gray-400 text-sm italic">"{word.sentence}"</p>
      )}

      {word.synonyms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {word.synonyms.map(syn => (
            <span
              key={syn}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full"
            >
              {syn}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        <span className="text-xs text-gray-400">
          Added {format(new Date(word.created_at), 'MMM d, yyyy')}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(word)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(word)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
