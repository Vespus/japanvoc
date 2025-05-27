import React from 'react';
import { BookOpen, FileText, BarChart3, Settings as SettingsIcon } from 'lucide-react';

export type TabType = 'quiz' | 'vocabulary' | 'stats' | 'settings';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'quiz' as TabType,
      label: 'Quiz',
      icon: BookOpen,
      description: 'Lernen'
    },
    {
      id: 'vocabulary' as TabType,
      label: 'Vokabeln',
      icon: FileText,
      description: 'Verwalten'
    },
    {
      id: 'stats' as TabType,
      label: 'Statistiken',
      icon: BarChart3,
      description: 'Fortschritt'
    },
    {
      id: 'settings' as TabType,
      label: 'Einstellungen',
      icon: SettingsIcon,
      description: 'Konfiguration'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={`${tab.label} - ${tab.description}`}
            >
              <Icon 
                size={24} 
                className={`mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
              />
              <span className={`text-xs font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 