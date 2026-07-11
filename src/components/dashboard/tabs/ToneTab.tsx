'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface ToneProfile {
  id: string
  adjectives: string[]
  example_responses: string[]
}

const TONE_OPTIONS = [
  'Funny', 'Direct', 'Educational', 'Friendly', 'Professional', 
  'Casual', 'Enthusiastic', 'Helpful', 'Witty', 'Inspirational'
]

export function ToneTab() {
  const { user } = useAuth()
  const [toneProfile, setToneProfile] = useState<ToneProfile | null>(null)
  const [selectedAdjectives, setSelectedAdjectives] = useState<string[]>([])
  const [examples, setExamples] = useState(['', '', ''])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchToneProfile()
    }
  }, [user])

  const fetchToneProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tone_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching tone profile:', error)
      } else if (data) {
        setToneProfile(data)
        setSelectedAdjectives(data.adjectives || [])
        setExamples(data.example_responses || ['', '', ''])
      }
    } catch (error) {
      console.error('Error fetching tone profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdjective = (adjective: string) => {
    setSelectedAdjectives(prev => 
      prev.includes(adjective)
        ? prev.filter(a => a !== adjective)
        : [...prev, adjective]
    )
  }

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples]
    newExamples[index] = value
    setExamples(newExamples)
  }

  const saveToneProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const profileData = {
        user_id: user.id,
        adjectives: selectedAdjectives,
        example_responses: examples.filter(e => e.trim() !== ''),
      }

      const { error } = toneProfile
        ? await supabase
            .from('tone_profiles')
            .update(profileData)
            .eq('id', toneProfile.id)
        : await supabase
            .from('tone_profiles')
            .insert([profileData])

      if (error) {
        toast.error('Failed to save tone profile')
      } else {
        toast.success('Tone profile saved successfully!')
        fetchToneProfile()
      }
    } catch (error) {
      toast.error('Failed to save tone profile')
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
        <h2 className="text-2xl font-bold text-gray-900">Voice Tone Calibration</h2>
        <p className="text-gray-600">Customize how EngageBot responds in your voice</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Your Tone</h3>
          <p className="text-sm text-gray-600 mb-4">Choose adjectives that describe your communication style:</p>
          
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map(adjective => (
              <button
                key={adjective}
                onClick={() => toggleAdjective(adjective)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedAdjectives.includes(adjective)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {adjective}
                {selectedAdjectives.includes(adjective) && (
                  <Check className="w-3 h-3 inline ml-1" />
                )}
              </button>
            ))}
          </div>
          
          {selectedAdjectives.length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-primary font-medium">
                Selected: {selectedAdjectives.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Example Responses</h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste 3 examples of responses you've given to comments. This helps the AI learn your style:
          </p>
          
          <div className="space-y-4">
            {examples.map((example, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Example {index + 1}
                </label>
                <textarea
                  value={example}
                  onChange={(e) => updateExample(index, e.target.value)}
                  placeholder="Paste a response you've written..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveToneProfile}
            disabled={saving || selectedAdjectives.length === 0}
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
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">How it works</h4>
            <p className="text-sm text-blue-700 mt-1">
              The AI will use your selected tone and example responses to generate suggestions that match your unique voice. 
              The more accurate your examples, the better the AI will understand your style.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}