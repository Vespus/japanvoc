import React from 'react';
import { TrendingUp, Calendar, Target, Award, Clock, Brain, BarChart3 } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { getLearningStats } from '../utils/sm2Algorithm';

export const StatsTab: React.FC = () => {
  const { vocabulary } = useVocabularyManager();
  const stats = getLearningStats(vocabulary);

  const statCards = [
    {
      title: 'Gesamt',
      value: stats.total,
      icon: Brain,
      color: 'bg-blue-500',
      description: 'Vokabeln insgesamt'
    },
    {
      title: 'Neue',
      value: stats.new,
      icon: Target,
      color: 'bg-green-500',
      description: 'Noch zu lernen'
    },
    {
      title: 'Lernphase',
      value: stats.learning,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      description: 'In Bearbeitung'
    },
    {
      title: 'Wiederholung',
      value: stats.review,
      icon: Calendar,
      color: 'bg-orange-500',
      description: 'Regelmäßig üben'
    },
    {
      title: 'Fällig heute',
      value: stats.due,
      icon: Clock,
      color: 'bg-red-500',
      description: 'Zu wiederholen'
    },
    {
      title: 'Gemeistert',
      value: stats.mastered,
      icon: Award,
      color: 'bg-purple-500',
      description: 'Gut gelernt'
    }
  ];

  const progressPercentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lernstatistiken</h1>
        <p className="text-gray-600">Dein Fortschritt im Überblick</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 p-4"> {/* pb-20 für Tab Bar */}
        
        {/* Fortschrittsübersicht */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Gesamtfortschritt</h2>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Gemeisterte Vokabeln</span>
              <span>{stats.mastered} von {stats.total} ({progressPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.due}</div>
              <div className="text-sm text-blue-700">Fällig heute</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.new}</div>
              <div className="text-sm text-green-700">Neue Vokabeln</div>
            </div>
          </div>
        </div>

        {/* Detaillierte Statistiken */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{card.title}</div>
                  <div className="text-xs text-gray-500">{card.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SM-2 Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lern-Insights</h2>
          
          <div className="space-y-4">
            {stats.due > 0 && (
              <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                <Clock className="mr-3 mt-0.5 text-red-600" size={16} />
                <div>
                  <div className="font-medium text-red-800">Fällige Wiederholungen</div>
                  <div className="text-sm text-red-700">
                    {stats.due} Vokabeln sollten heute wiederholt werden für optimales Lernen.
                  </div>
                </div>
              </div>
            )}
            
            {stats.overdue > 0 && (
              <div className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Calendar className="mr-3 mt-0.5 text-orange-600" size={16} />
                <div>
                  <div className="font-medium text-orange-800">Überfällige Vokabeln</div>
                  <div className="text-sm text-orange-700">
                    {stats.overdue} Vokabeln sind überfällig. Wiederhole sie bald, um das Gelernte nicht zu vergessen.
                  </div>
                </div>
              </div>
            )}
            
            {stats.mastered > 0 && (
              <div className="flex items-start p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <Award className="mr-3 mt-0.5 text-purple-600" size={16} />
                <div>
                  <div className="font-medium text-purple-800">Gut gemacht!</div>
                  <div className="text-sm text-purple-700">
                    Du hast bereits {stats.mastered} Vokabeln gemeistert. Weiter so!
                  </div>
                </div>
              </div>
            )}
            
            {stats.new > 0 && (
              <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                <Brain className="mr-3 mt-0.5 text-green-600" size={16} />
                <div>
                  <div className="font-medium text-green-800">Neue Herausforderungen</div>
                  <div className="text-sm text-green-700">
                    {stats.new} neue Vokabeln warten darauf, gelernt zu werden.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leer State */}
        {stats.total === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Keine Daten verfügbar</h3>
            <p className="text-sm">
              Füge Vokabeln hinzu und starte ein Quiz, um Statistiken zu sehen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 