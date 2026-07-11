'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, MessageSquare, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface UsageStats {
  comments_processed: number
  responses_generated: number
  responses_sent: number
  date: string
}

export function AnalyticsTab() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UsageStats[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, timeRange])

  const fetchStats = async () => {
    if (!user) return

    setLoading(true)
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching stats:', error)
      } else {
        setStats(data || [])
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalStats = () => {
    return stats.reduce((acc, stat) => ({
      comments_processed: acc.comments_processed + stat.comments_processed,
      responses_generated: acc.responses_generated + stat.responses_generated,
      responses_sent: acc.responses_sent + stat.responses_sent,
    }), {
      comments_processed: 0,
      responses_generated: 0,
      responses_sent: 0,
    })
  }

  const totalStats = getTotalStats()

  const getAverageResponseRate = () => {
    if (totalStats.comments_processed === 0) return 0
    return Math.round((totalStats.responses_sent / totalStats.comments_processed) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your engagement metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Comments Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.comments_processed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Send className="w-6 h-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Responses Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.responses_generated}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Responses Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.responses_sent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{getAverageResponseRate()}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {stats.slice(0, 7).reverse().map((stat, index) => (
                <div key={stat.date} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="w-full bg-gray-200 rounded-t relative">
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t"
                      style={{ 
                        height: `${Math.max((stat.comments_processed / Math.max(...stats.map(s => s.comments_processed))) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {stat.comments_processed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}