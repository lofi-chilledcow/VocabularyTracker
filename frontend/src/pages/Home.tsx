import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import WordCard from '../components/WordCard'
import WordForm from '../components/WordForm'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import SortBar from '../components/SortBar'
import StatsBar from '../components/StatsBar'
import type { Word, WordFormData } from '../types'

export default function Home() {
  const { words, loading, error, filter, setFilter, refetch, createWord, updateWord, deleteWord } = useWords()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Word | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // StatsBar is self-fetching; we trigger a re-mount key to refresh it
  const [statsKey, setStatsKey] = useState(0)

  function refreshAll() {
    refetch()
    setStatsKey(k => k + 1)
  }

  function openCreate() {
    setEditTarget(null)
    setModalOpen(true)
  }

  function openEdit(word: Word) {
    setEditTarget(word)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTarget(null)
  }

  async function handleSubmit(data: WordFormData) {
    setSubmitting(true)
    try {
      if (editTarget) {
        await updateWord(editTarget.id, data)
      } else {
        await createWord(data)
      }
      closeModal()
      refreshAll()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteWord(deleteTarget.id)
      setDeleteTarget(null)
      refreshAll()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        <StatsBar key={statsKey} />

        <SortBar value={filter} onChange={setFilter} />

        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 bg-white border border-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <span className="text-5xl">📖</span>
            <p className="text-lg font-medium">Add your first word!</p>
            <p className="text-sm">Click the + button to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {words.map(w => (
              <WordCard
                key={w.id}
                word={w}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        title="Add word"
      >
        <Plus size={24} />
      </button>

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Edit word' : 'Add new word'}
      >
        <WordForm
          key={editTarget?.id ?? 'new'}
          initialValues={editTarget ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={submitting}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete "${deleteTarget?.word}"? This cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  )
}
