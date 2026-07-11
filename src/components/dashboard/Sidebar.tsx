'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, 
  Settings, 
  BarChart3, 
  User, 
  Instagram, 
  Music,
  Home,
  Mail
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'accounts', label: 'Social Accounts', icon: User },
    { id: 'tone', label: 'Voice Tone', icon: Settings },
    { id: 'automation', label: 'Automation', icon: Mail },
  ]

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-xl font-bold text-gray-800">EngageBot</span>
        </Link>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-sm text-gray-600">Connected Platforms</span>
        </div>
        <Link
          href="/"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}