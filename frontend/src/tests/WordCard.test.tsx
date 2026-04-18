import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordCard from '../components/WordCard'
import type { Word } from '../types'

const word: Word = {
  id: '1',
  word: 'Ephemeral',
  meaning: 'Lasting a very short time',
  sentence: 'Social media trends are ephemeral.',
  category: 'Adjective',
  synonyms: ['fleeting', 'transient'],
  created_at: '2024-01-01 00:00:00',
  updated_at: '2024-01-01 00:00:00',
}

describe('WordCard', () => {
  it('renders word and meaning correctly', () => {
    render(<WordCard word={word} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Ephemeral')).toBeInTheDocument()
    expect(screen.getByText('Lasting a very short time')).toBeInTheDocument()
  })

  it('renders sentence if present', () => {
    render(<WordCard word={word} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/"Social media trends are ephemeral\."/)).toBeInTheDocument()
  })

  it('renders synonyms as pills', () => {
    render(<WordCard word={word} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('fleeting')).toBeInTheDocument()
    expect(screen.getByText('transient')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<WordCard word={word} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Adjective')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<WordCard word={word} onEdit={onEdit} onDelete={() => {}} />)
    await userEvent.click(screen.getByTitle('Edit'))
    expect(onEdit).toHaveBeenCalledWith(word)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<WordCard word={word} onEdit={() => {}} onDelete={onDelete} />)
    await userEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith(word)
  })
})
