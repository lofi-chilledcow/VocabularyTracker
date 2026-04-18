import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import WordForm from '../components/WordForm'

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

const noop = vi.fn().mockResolvedValue(undefined)

describe('WordForm', () => {
  beforeEach(() => {
    noop.mockClear()
  })

  it('renders all fields', async () => {
    render(<WordForm onSubmit={noop} onCancel={() => {}} isLoading={false} />)
    // findBy* awaits the async categories useEffect to settle before asserting
    expect(await screen.findByPlaceholderText('e.g. Ephemeral')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Definition…')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Use it in a sentence…')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Noun')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add antonym')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('shows error if word is empty on submit', async () => {
    render(<WordForm onSubmit={noop} onCancel={() => {}} isLoading={false} />)
    await userEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Word is required')).toBeInTheDocument()
    expect(noop).not.toHaveBeenCalled()
  })

  it('shows error if meaning is empty on submit', async () => {
    render(<WordForm onSubmit={noop} onCancel={() => {}} isLoading={false} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ephemeral'), 'Serendipity')
    await userEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Meaning is required')).toBeInTheDocument()
    expect(noop).not.toHaveBeenCalled()
  })

  it('calls onSubmit with correct data when valid', async () => {
    render(<WordForm onSubmit={noop} onCancel={() => {}} isLoading={false} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ephemeral'), 'Serendipity')
    await userEvent.type(screen.getByPlaceholderText('Definition…'), 'Finding good things by chance')
    await userEvent.click(screen.getByText('Save'))
    expect(noop).toHaveBeenCalledWith(
      expect.objectContaining({
        word: 'Serendipity',
        meaning: 'Finding good things by chance',
      })
    )
  })
})
