import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/ai/generate-response/route'
import { createServerSupabaseClient } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase')
const mockCreateServerSupabaseClient = createServerSupabaseClient as jest.MockedFunction<typeof createServerSupabaseClient>

describe('/api/ai/generate-response', () => {
  beforeEach(() => {
    mockCreateServerSupabaseClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'comment-123',
                content: 'Great post!',
                author_username: 'fan123',
              },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any)
  })

  it('returns 405 for GET requests', async () => {
    const { req } = createMocks({
      method: 'GET',
    })

    const res = await GET(req)
    expect(res.status).toBe(405)
  })

  it('generates AI response for valid comment', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        commentId: 'comment-123',
      },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    
    const data = await res.json()
    expect(data).toHaveProperty('response')
    expect(typeof data.response).toBe('string')
  })

  it('returns 401 for unauthenticated requests', async () => {
    mockCreateServerSupabaseClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Unauthorized' },
        }),
      },
    } as any)

    const { req } = createMocks({
      method: 'POST',
      body: {
        commentId: 'comment-123',
      },
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing commentId', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {},
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})