import { render, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  })),
}))

const TestComponent = () => {
  const { user, loading } = useAuth()
  return (
    <div>
      {loading ? <div>Loading...</div> : user ? <div>Logged in</div> : <div>Not logged in</div>}
    </div>
  )
}

describe('AuthContext', () => {
  it('provides authentication state', async () => {
    await act(async () => {
      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
      
      expect(getByText('Loading...')).toBeInTheDocument()
    })
  })

  it('handles authentication state changes', async () => {
    const mockSupabase = createClient()
    const mockOnAuthStateChange = mockSupabase.auth.onAuthStateChange as jest.Mock
    
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })
    
    expect(mockOnAuthStateChange).toHaveBeenCalled()
  })
})