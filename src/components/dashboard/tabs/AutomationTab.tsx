'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Save, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface AutomationSettings {
  id: string
  welcome_dm_enabled: boolean
  welcome_dm_message?: string
  weekly_report_enabled: boolean
}

export function AutomationTab() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AutomationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching automation settings:', error)
      } else if (data) {
        setSettings(data)
        setWelcomeMessage(data.welcome_dm_message || '')
      }
    } catch (error) {
      console.error('Error fetching automation settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWelcomeDM = (enabled: boolean) => {
    if (settings) {
      setSettings({ ...settings, welcome_dm_enabled: enabled })
    }
  }

  const toggleWeeklyReport = (enabled: boolean) => {
    if (settings) {
      setSettings({ ...settings, weekly_report_enabled: enabled })
    }
  }

  const saveSettings = async () => {
    if (!user || !settings) return

    setSaving(true)
    try {
      const settingsData = {
        user_id: user.id,
        welcome_dm_enabled: settings.welcome_dm_enabled,
        welcome_dm_message: welcomeMessage,
        weekly_report_enabled: settings.weekly_report_enabled,
      }

      const { error } = settings.id
        ? await supabase
            .from('automation_settings')
            .update(settingsData)
            .eq('id', settings.id)
        : await supabase
            .from('automation_settings')
            .insert([settingsData])

      if (error) {
        toast.error('Failed to save automation settings')
      } else {
        toast.success('Automation settings saved successfully!')
        fetchSettings()
      }
    } catch (error) {
      toast.error('Failed to save automation settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Automation</h2>
        <p className="text-gray-600">Configure automated messages and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Welcome DM</h3>
              <p className="text-sm text-gray-500">Automatically message new followers</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable Welcome DM</span>
              <button
                onClick={() => toggleWelcomeDM(!settings?.welcome_dm_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings?.welcome_dm_enabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings?.welcome_dm_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings?.welcome_dm_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Thanks for following! I'm excited to have you here..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {name} to insert the follower's name
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Weekly Report</h3>
              <p className="text-sm text-gray-500">Get weekly engagement summaries</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable Weekly Report</span>
              <button
                onClick={() => toggleWeeklyReport(!settings?.weekly_report_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings?.weekly_report_enabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings?.weekly_report_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings?.weekly_report_enabled && (
              <div className="p-3 bg-secondary/5 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary font-medium">
                      Weekly reports enabled
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      You'll receive an email every Monday with your engagement metrics
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        
        <div className="space-y-4">
          {settings?.welcome_dm_enabled && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Welcome DM Preview:</p>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-800">
                  {welcomeMessage || "Thanks for following! I'm excited to have you here."}
                </p>
              </div>
            </div>
          )}
          
          {settings?.weekly_report_enabled && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Weekly Report Preview:</p>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-800 mb-2">Weekly Engagement Report</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Most commented posts: 3</li>
                  <li>• Total engagement: 245</li>
                  <li>• Responses sent: 42</li>
                  <li>• Top commenter: @user123</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Important</h4>
            <p className="text-sm text-blue-700 mt-1">
              Automation features will only work when you have connected social accounts and 
              the system has active data to process. Make sure your accounts are properly connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}