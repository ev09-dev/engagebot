import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentCard } from '@/components/dashboard/CommentCard'
import { useAuth } from '@/contexts/AuthContext'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext')

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
}

const mockComment = {
  id: 'comment-123',
  content: 'Great post! Love your content.',
  author_username: 'fan123',
  platform: 'instagram',
  created_at: '2023-01-01T00:00:00Z',
  relevance_score: 0.8,
  is_spam: false,
  user_id: 'user-123',
}

describe('CommentCard', () => {
  beforeEach(() => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    })
  })

  it('renders comment content and author', () => {
    render(<CommentCard comment={mockComment} onResponseGenerated={jest.fn()} />)
    
    expect(screen.getByText('Great post! Love your content.')).toBeInTheDocument()
    expect(screen.getByText('@fan123')).toBeInTheDocument()
  })

  it('shows platform icon', () => {
    render(<CommentCard comment={mockComment} onResponseGenerated={jest.fn()} />)
    
    expect(screen.getByTestId('platform-icon')).toBeInTheDocument()
  })

  it('displays relevance score with correct color', () => {
    render(<CommentCard comment={mockComment} onResponseGenerated={jest.fn()} />)
    
    expect(screen.getByText('Relevance: 80%')).toBeInTheDocument()
    expect(screen.getByText('Relevance: 80%')).toHaveClass('text-green-600')
  })

  it('generates AI response when button is clicked', async () => {
    const onResponseGenerated = jest.fn()
    render(<CommentCard comment={mockComment} onResponseGenerated={onResponseGenerated} />)
    
    const generateButton = screen.getByText('Generate Response')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Generating response...')).toBeInTheDocument()
    })
  })

  it('marks comment as spam', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock

    render(<CommentCard comment={mockComment} onResponseGenerated={jest.fn()} />)
    
    const spamButton = screen.getByText('Mark as Spam')
    fireEvent.click(spamButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/comments/spam', expect.any(Object))
    })
  })

  it('disables buttons when user is not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })

    render(<CommentCard comment={mockComment} onResponseGenerated={jest.fn()} />)
    
    expect(screen.getByText('Generate Response')).toBeDisabled()
    expect(screen.getByText('Mark as Spam')).toBeDisabled()
  })
})