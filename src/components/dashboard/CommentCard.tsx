'use client'

import { useState } from 'react'
import { Instagram, Music, Send, ThumbsUp, Flag, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Comment {
  id: string
  content: string
  author_username: string
  author_profile_pic?: string
  platform: 'instagram' | 'tiktok'
  created_at: string
  relevance_score: number
  is_spam: boolean
  post_id: string
}

interface CommentCardProps {
  comment: Comment
  onResponseGenerated: () => void
}

export function CommentCard({ comment, onResponseGenerated }: CommentCardProps) {
  const { user } = useAuth()
  const [response, setResponse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const generateResponse = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      // Call the AI response generation API
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: comment.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response')
      }

      setResponse(data.response)
      toast.success('Response generated!')
    } catch (error) {
      console.error('Error generating response:', error)
      toast.error('Failed to generate response')
    } finally {
      setIsGenerating(false)
    }
  }

  const sendResponse = async () => {
    if (!user || !response.trim()) return

    setIsSending(true)
    try {
      // Update the response to mark it as approved and sent
      const { error } = await supabase
        .from('responses')
        .update({
          is_approved: true,
          is_sent: true,
        })
        .eq('comment_id', comment.id)
        .eq('user_id', user.id)

      if (error) {
        toast.error('Failed to send response')
      } else {
        toast.success('Response sent!')
        onResponseGenerated()
      }
    } catch (error) {
      toast.error('Failed to send response')
    } finally {
      setIsSending(false)
    }
  }

  const markAsSpam = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_spam: true })
        .eq('id', comment.id)
        .eq('user_id', user.id)

      if (error) {
        toast.error('Failed to mark as spam')
      } else {
        toast.success('Marked as spam')
        onResponseGenerated()
      }
    } catch (error) {
      toast.error('Failed to mark as spam')
    }
  }

  const getPlatformIcon = () => {
    return comment.platform === 'instagram' ? 
      <Instagram className="w-4 h-4 text-pink-500" /> : 
      <Music className="w-4 h-4 text-black" />
  }

  const getRelevanceColor = () => {
    if (comment.relevance_score >= 0.8) return 'text-green-600'
    if (comment.relevance_score >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${comment.is_spam ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {comment.author_profile_pic ? (
              <img 
                src={comment.author_profile_pic} 
                alt={comment.author_username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {comment.author_username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.author_username}</span>
              {getPlatformIcon()}
              <span className={`text-xs font-medium ${getRelevanceColor()}`}>
                {Math.round(comment.relevance_score * 100)}% relevant
              </span>
              {comment.is_spam && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Spam</span>
              )}
            </div>
            
            <p className="text-gray-700 mt-1">{comment.content}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
              <button className="flex items-center space-x-1 hover:text-gray-700">
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={markAsSpam}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Flag className="w-4 h-4 inline mr-2" />
                Mark as spam
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        {!response ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={generateResponse}
              disabled={isGenerating}
              className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate Response</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="Edit the response..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setResponse('')}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={sendResponse}
                disabled={isSending || !response.trim()}
                className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Response</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}