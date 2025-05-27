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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-700 via-amber-800 to-stone-800 text-amber-50 shadow-2xl">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-extralight tracking-widest">Einstellungen</h1>
          
          {hasChanges && (
            <button
              onClick={saveSettings}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg font-light tracking-wide"
            >
              <Save size={16} className="mr-2 opacity-90" />
              Speichern
            </button>
          )}
        </div>
      </header>

      {/* Success Message */}
      {showSaved && (
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 border border-teal-300/60 text-teal-800 px-4 py-3 mx-4 mt-4 rounded-2xl shadow-lg font-light">
          ✅ Einstellungen erfolgreich gespeichert!
        </div>
      )}

      {/* Settings Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {/* Quiz-Konfiguration */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl border border-amber-300/60 shadow-lg p-6">
          <h2 className="text-lg font-light text-stone-800 mb-4 tracking-wide">
            Quiz-Konfiguration
          </h2>
          
          {/* Abfragerichtung */}
          <div className="mb-6">
            <label className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Abfragerichtung
            </label>
            <div className="space-y-3">
              {directionOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start p-4 border border-amber-200/60 rounded-2xl cursor-pointer hover:bg-amber-50/50 transition-all duration-300 hover:shadow-md"
                >
                  <input
                    type="radio"
                    name="direction"
                    value={option.value}
                    checked={settings.direction === option.value}
                    onChange={(e) => updateSetting('direction', e.target.value as QuizDirection)}
                    className="mt-1 mr-3 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-light text-stone-800 tracking-wide">{option.label}</div>
                    <div className="text-sm text-stone-600 font-light">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Anzahl Vokabeln pro Quiz */}
          <div>
            <label className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Vokabeln pro Quiz
            </label>
            <div className="grid grid-cols-4 gap-3">
              {wordsPerQuizOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => updateSetting('wordsPerQuiz', count)}
                  className={`p-3 text-center rounded-xl border transition-all duration-300 font-light ${
                    settings.wordsPerQuiz === count
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-600 shadow-lg'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-amber-50 hover:border-amber-300 shadow-sm'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-sm text-stone-600 mt-3 font-light">
              Aktuell: {settings.wordsPerQuiz} Vokabeln pro Quiz-Session
            </p>
          </div>
        </div>

        {/* Aktionen */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl border border-amber-300/60 shadow-lg p-6">
          <h2 className="text-lg font-light text-stone-800 mb-4 tracking-wide">
            Aktionen
          </h2>
          
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center px-4 py-3 border border-stone-300 text-stone-700 rounded-2xl hover:bg-stone-50 hover:border-stone-400 transition-all duration-300 font-light tracking-wide shadow-sm"
          >
            <RotateCcw size={16} className="mr-2 opacity-80" />
            Auf Standardwerte zurücksetzen
          </button>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/60 rounded-3xl p-5 shadow-sm">
          <h3 className="font-light text-amber-800 mb-2 tracking-wide">💡 Tipp</h3>
          <p className="text-amber-700 text-sm font-light leading-relaxed">
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