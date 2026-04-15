import Modal from './Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
  isLoading?: boolean
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message, isLoading }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}
