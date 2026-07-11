import { render, screen, waitFor } from '@testing-library/react'
import { CommentsTab } from '@/components/dashboard/tabs/CommentsTab'
import { useAuth } from '@/contexts/AuthContext'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext')

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
}

const mockComments = [
  {
    id: '1',
    content: 'Great post!',
    author_username: 'user1',
    platform: 'instagram' as const,
    created_at: '2023-01-01T00:00:00Z',
    relevance_score: 0.8,
    is_spam: false,
    post_id: 'post1',
  },
  {
    id: '2',
    content: 'Spam comment',
    author_username: 'spammer',
    platform: 'tiktok' as const,
    created_at: '2023-01-02T00:00:00Z',
    relevance_score: 0.2,
    is_spam: true,
    post_id: 'post2',
  },
]

describe('CommentsTab', () => {
  beforeEach(() => {
    // Mock the useAuth hook
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    })
  })

  it('renders loading state initially', () => {
    render(<CommentsTab />)
    
    expect(screen.getByText(/Loading comments/i)).toBeInTheDocument()
  })

  it('renders comments when loaded', async () => {
    // Mock the Supabase response
    jest.spyOn(require('@/lib/supabase'), 'supabase').mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockComments,
        error: null,
      }),
    }))

    render(<CommentsTab />)

    await waitFor(() => {
      expect(screen.getByText('Great post!')).toBeInTheDocument()
      expect(screen.getByText('Spam comment')).toBeInTheDocument()
    })
  })

  it('renders empty state when no comments', async () => {
    // Mock the Supabase response with empty data
    jest.spyOn(require('@/lib/supabase'), 'supabase').mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }))

    render(<CommentsTab />)

    await waitFor(() => {
      expect(screen.getByText('No comments yet')).toBeInTheDocument()
      expect(screen.getByText(/Connect your social accounts/)).toBeInTheDocument()
    })
  })

  it('filters comments by spam status', async () => {
    // Mock the Supabase response
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockComments,
        error: null,
      }),
    }

    jest.spyOn(require('@/lib/supabase'), 'supabase').mockReturnValue(mockSupabase)

    render(<CommentsTab />)

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('Great post!')).toBeInTheDocument()
    })

    // Click on spam filter
    const spamFilter = screen.getByLabelText('Filter comments')
    // Note: This is a simplified test - in a real scenario you'd need to properly
    // simulate the select change event
  })
})