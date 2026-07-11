'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Heart, Filter, RefreshCw } from 'lucide-react'
import { CommentCard } from '../CommentCard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

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

export function CommentsTab() {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'spam' | 'non-spam'>('all')

  useEffect(() => {
    if (user) {
      fetchComments()
    }
  }, [user, filter])

  const fetchComments = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('comments')
        .select('*')
        .eq('user_id', user.id)
        .order('relevance_score', { ascending: false })

      if (filter === 'spam') {
        query = query.eq('is_spam', true)
      } else if (filter === 'non-spam') {
        query = query.eq('is_spam', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching comments:', error)
      } else {
        setComments(data || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshComments = () => {
    fetchComments()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
          <p className="text-gray-600">Unified feed from Instagram and TikTok</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Comments</option>
              <option value="non-spam">Non-Spam</option>
              <option value="spam">Spam</option>
            </select>
          </div>
          <button
            onClick={refreshComments}
            className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
          <p className="text-gray-500">Connect your social accounts to start seeing comments here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onResponseGenerated={() => fetchComments()}
            />
          ))}
        </div>
      )}
    </div>
  )
}