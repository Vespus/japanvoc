import React, { useState } from 'react';

interface Vocabulary {
  japanese: string;
  kana: string;
  german: string;
  example?: string;
}

interface KiVocabPrototypeProps {
  onClose: () => void;
}

export const KiVocabPrototype: React.FC<KiVocabPrototypeProps> = ({ onClose }) => {
  const [count, setCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler bei der Generierung');
      }

      const data = await response.json();
      setVocabularies(data.vocabularies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      console.error('Fehler:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-50/95 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light text-stone-700">KI Vokabel Generator</h2>
          <span className="text-xs text-stone-400 ml-2">v0.04</span>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Anzahl neuer Vokabeln
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generiere...' : 'Vokabeln generieren'}
          </button>

          {vocabularies.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-stone-700">Generierte Vokabeln</h3>
              <div className="space-y-3">
                {vocabularies.map((vocab, index) => (
                  <div
                    key={index}
                    className="p-4 border border-amber-200 rounded-lg bg-amber-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xl font-medium text-stone-800">
                          {vocab.japanese}
                        </div>
                        <div className="text-sm text-stone-600">
                          {vocab.kana}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-stone-800">
                          {vocab.german}
                        </div>
                      </div>
                    </div>
                    {vocab.example && (
                      <div className="mt-2 text-sm text-stone-600">
                        {vocab.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 