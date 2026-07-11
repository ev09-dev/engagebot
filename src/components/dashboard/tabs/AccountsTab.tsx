'use client'

import { useState, useEffect } from 'react'
import { Instagram, Music, Plus, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface SocialAccount {
  id: string
  platform: 'instagram' | 'tiktok'
  platform_username: string
  is_active: boolean
  created_at: string
}

export function AccountsTab() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  const fetchAccounts = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching accounts:', error)
      } else {
        setAccounts(data || [])
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectInstagram = async () => {
    setConnecting('instagram')
    try {
      // Generate a random state parameter for security
      const state = Math.random().toString(36).substring(2, 15)
      
      // Store the state in sessionStorage for verification when the user returns
      sessionStorage.setItem('instagram_oauth_state', state)
      
      // Construct the Instagram OAuth URL
      const instagramOAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!)}&scope=user_profile,user_media&response_type=code&state=${state}`
      
      // Redirect to Instagram OAuth
      window.location.href = instagramOAuthUrl
    } catch (error) {
      toast.error('Failed to initiate Instagram connection')
      setConnecting(null)
    }
  }

  const connectTikTok = async () => {
    setConnecting('tiktok')
    try {
      // Generate a random state parameter for security
      const state = Math.random().toString(36).substring(2, 15)
      
      // Store the state in sessionStorage for verification when the user returns
      sessionStorage.setItem('tiktok_oauth_state', state)
      
      // Construct the TikTok OAuth URL
      const tikTokOAuthUrl = `https://open-api.tiktok.com/platform/oauth/connect/?client_key=${process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI!)}&response_type=code&scope=user.info.basic&state=${state}`
      
      // Redirect to TikTok OAuth
      window.location.href = tikTokOAuthUrl
    } catch (error) {
      toast.error('Failed to initiate TikTok connection')
      setConnecting(null)
    }
  }

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId)

      if (error) {
        toast.error('Failed to disconnect account')
      } else {
        toast.success('Account disconnected successfully')
        fetchAccounts()
      }
    } catch (error) {
      toast.error('Failed to disconnect account')
    }
  }

  const getPlatformIcon = (platform: 'instagram' | 'tiktok') => {
    return platform === 'instagram' ? 
      <Instagram className="w-5 h-5 text-pink-500" /> : 
      <Music className="w-5 h-5 text-black" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Social Accounts</h2>
        <p className="text-gray-600">Connect your Instagram and TikTok accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Instagram className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Instagram</h3>
                <p className="text-sm text-gray-500">Connect your Instagram account</p>
              </div>
            </div>
            <button
              onClick={connectInstagram}
              disabled={connecting === 'instagram'}
              className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {connecting === 'instagram' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
          
          {accounts.filter(a => a.platform === 'instagram').map(account => (
            <div key={account.id} className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900">{account.platform_username}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
                </div>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-black rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">TikTok</h3>
                <p className="text-sm text-gray-500">Connect your TikTok account</p>
              </div>
            </div>
            <button
              onClick={connectTikTok}
              disabled={connecting === 'tiktok'}
              className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {connecting === 'tiktok' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
          
          {accounts.filter(a => a.platform === 'tiktok').map(account => (
            <div key={account.id} className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900">{account.platform_username}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
                </div>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Important</h4>
            <p className="text-sm text-blue-700 mt-1">
              Connecting your social accounts allows EngageBot to fetch your comments and post responses on your behalf. 
              We use official APIs and your credentials are securely stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}