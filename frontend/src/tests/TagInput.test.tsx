import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import TagInput from '../components/TagInput'

function Wrapper({ initial = [] }: { initial?: string[] }) {
  const [tags, setTags] = useState<string[]>(initial)
  return <TagInput value={tags} onChange={setTags} />
}

describe('TagInput', () => {
  it('adds tag on Enter key', async () => {
    render(<Wrapper />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'fleeting{Enter}')
    expect(screen.getByText('fleeting', { exact: false })).toBeInTheDocument()
  })

  it('adds tag on comma key', async () => {
    render(<Wrapper />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'transient,')
    expect(screen.getByText('transient', { exact: false })).toBeInTheDocument()
  })

  it('removes tag on × click', async () => {
    render(<Wrapper initial={['fleeting']} />)
    expect(screen.getByText('fleeting', { exact: false })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '×' }))
    expect(screen.queryByText('fleeting', { exact: false })).not.toBeInTheDocument()
  })

  it('does not add duplicate tags', async () => {
    render(<Wrapper />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'fleeting{Enter}')
    await userEvent.type(input, 'fleeting{Enter}')
    const buttons = screen.getAllByRole('button', { name: '×' })
    expect(buttons).toHaveLength(1)
  })
})
