import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface GenerateResponseRequest {
  commentId: string
  toneProfile?: {
    adjectives: string[]
    example_responses: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { commentId, toneProfile }: GenerateResponseRequest = await request.json()

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Get the user's session from Supabase
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the comment details
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', session.user.id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Get the user's tone profile if not provided
    let userToneProfile = toneProfile
    if (!userToneProfile) {
      const { data: toneProfileData } = await supabase
        .from('tone_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      userToneProfile = toneProfileData || {
        adjectives: ['friendly', 'helpful'],
        example_responses: []
      }
    }

    // Generate AI response using Nemotron-3.5-content-safety
    const aiResponse = await generateAIResponse(comment, userToneProfile)

    // Save the generated response to the database
    const { error: saveError } = await supabase.from('responses').insert({
      user_id: session.user.id,
      comment_id: commentId,
      content: aiResponse,
      is_ai_generated: true,
      is_approved: false,
      is_sent: false,
    })

    if (saveError) {
      console.error('Error saving response:', saveError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Error generating AI response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateAIResponse(comment: any, toneProfile: any): Promise<string> {
  // This is a mock implementation
  // In a real implementation, you would call the Nemotron-3.5-content-safety API
  
  const toneDescription = toneProfile.adjectives.join(', ')
  const examples = toneProfile.example_responses.join('\n')
  
  // Create a prompt for the AI
  const prompt = `
    Generate a response to the following comment. The response should be ${toneDescription}.
    
    Comment: "${comment.content}"
    Comment author: ${comment.author_username}
    
    ${examples ? `Here are some examples of the user's writing style:\n${examples}` : ''}
    
    Generate a concise, helpful response that matches the user's tone.
  `

  // Mock AI response - in reality, this would call the AI service
  const mockResponses = [
    `Thanks for your comment, ${comment.author_username}! I really appreciate you taking the time to engage with my content.`,
    `Hey ${comment.author_username}, thanks so much for your thoughtful comment! It means a lot to me.`,
    `I'm glad you enjoyed this, ${comment.author_username}! Your support is truly appreciated.`,
    `Thank you for your kind words, ${comment.author_username}! I'm happy you found this valuable.`,
  ]

  // Return a random mock response
  return mockResponses[Math.floor(Math.random() * mockResponses.length)]
}