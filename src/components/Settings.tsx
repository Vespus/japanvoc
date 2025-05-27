import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface SettingsProps {
  // Keine Props mehr benötigt - Navigation über Tab Bar
}

export type QuizDirection = 'jp-to-de' | 'de-to-jp' | 'kanji-to-reading' | 'random';

export interface QuizSettings {
  direction: QuizDirection;
  wordsPerQuiz: number;
}

const SETTINGS_KEY = 'japanvoc-settings';

const DEFAULT_SETTINGS: QuizSettings = {
  direction: 'jp-to-de',
  wordsPerQuiz: 20
};

export const Settings: React.FC<SettingsProps> = () => {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Einstellungen laden
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
      }
    }
  }, []);

  // Einstellungen speichern
  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setHasChanges(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    console.log('⚙️ Einstellungen gespeichert:', settings);
  };

  // Einstellungen zurücksetzen
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  // Änderungen verfolgen
  const updateSetting = <K extends keyof QuizSettings>(
    key: K, 
    value: QuizSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const directionOptions = [
    {
      value: 'jp-to-de' as QuizDirection,
      label: 'Japanisch → Deutsch',
      description: 'Kanji + Kana → Bedeutung'
    },
    {
      value: 'de-to-jp' as QuizDirection,
      label: 'Deutsch → Japanisch',
      description: 'Bedeutung → Kanji + Kana'
    },
    {
      value: 'kanji-to-reading' as QuizDirection,
      label: 'Kanji → Lesung',
      description: 'Kanji → Kana + Romaji'
    },
    {
      value: 'random' as QuizDirection,
      label: 'Zufällig',
      description: 'Gemischte Abfragerichtungen'
    }
  ];

  const wordsPerQuizOptions = [5, 10, 15, 20, 25, 30, 50];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Einstellungen</h1>
          
          {hasChanges && (
            <button
              onClick={saveSettings}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} className="mr-2" />
              Speichern
            </button>
          )}
        </div>
      </header>

      {/* Success Message */}
      {showSaved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          ✅ Einstellungen erfolgreich gespeichert!
        </div>
      )}

      {/* Settings Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {/* Quiz-Konfiguration */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quiz-Konfiguration
          </h2>
          
          {/* Abfragerichtung */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Abfragerichtung
            </label>
            <div className="space-y-2">
              {directionOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="direction"
                    value={option.value}
                    checked={settings.direction === option.value}
                    onChange={(e) => updateSetting('direction', e.target.value as QuizDirection)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Anzahl Vokabeln pro Quiz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vokabeln pro Quiz
            </label>
            <div className="grid grid-cols-4 gap-2">
              {wordsPerQuizOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => updateSetting('wordsPerQuiz', count)}
                  className={`p-2 text-center rounded-lg border transition-colors ${
                    settings.wordsPerQuiz === count
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Aktuell: {settings.wordsPerQuiz} Vokabeln pro Quiz-Session
            </p>
          </div>
        </div>

        {/* Aktionen */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Aktionen
          </h2>
          
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            Auf Standardwerte zurücksetzen
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tipp</h3>
          <p className="text-blue-800 text-sm">
            Die Einstellungen werden automatisch für alle zukünftigen Quiz-Sessions übernommen. 
            Du kannst sie jederzeit hier ändern.
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook für andere Komponenten um Einstellungen zu laden
export const useQuizSettings = (): QuizSettings => {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
      }
    }
  }, []);

  return settings;
}; 