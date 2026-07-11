'use client'

import { CommentsTab } from './tabs/CommentsTab'
import { AnalyticsTab } from './tabs/AnalyticsTab'
import { AccountsTab } from './tabs/AccountsTab'
import { ToneTab } from './tabs/ToneTab'
import { AutomationTab } from './tabs/AutomationTab'

interface MainContentProps {
  activeTab: string
}

export function MainContent({ activeTab }: MainContentProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'comments':
        return <CommentsTab />
      case 'analytics':
        return <AnalyticsTab />
      case 'accounts':
        return <AccountsTab />
      case 'tone':
        return <ToneTab />
      case 'automation':
        return <AutomationTab />
      default:
        return <CommentsTab />
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6">
        {renderTabContent()}
      </div>
    </main>
  )
}