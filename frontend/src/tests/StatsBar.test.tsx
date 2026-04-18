import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import StatsBar from '../components/StatsBar'
import client from '../api/client'

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockStats = {
  totalWords: 42,
  wordsToday: 3,
  wordsThisWeek: 7,
  streakDays: 5,
  totalCategories: 4,
}

describe('StatsBar', () => {
  beforeEach(() => {
    vi.mocked(client.get).mockResolvedValue({ data: mockStats })
  })

  it('renders 4 stat cards', async () => {
    render(<StatsBar />)
    expect(await screen.findByText('Total words')).toBeInTheDocument()
    expect(await screen.findByText('Added today')).toBeInTheDocument()
    expect(await screen.findByText('This week')).toBeInTheDocument()
    expect(await screen.findByText(/Streak/)).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(client.get).mockReturnValue(new Promise(() => {}))
    const { container } = render(<StatsBar />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('displays stats after fetch resolves', async () => {
    render(<StatsBar />)
    expect(await screen.findByText('42')).toBeInTheDocument()
    expect(await screen.findByText('3')).toBeInTheDocument()
    expect(await screen.findByText('5d')).toBeInTheDocument()
  })
})
