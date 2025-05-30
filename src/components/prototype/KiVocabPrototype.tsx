import React, { useState } from 'react';
import { useVocabularyManager } from '../../hooks/useVocabularyManager';

interface Vocabulary {
  japanese: string;
  kana: string;
  german: string;
  example?: string;
}

interface KiVocabPrototypeProps {
  onClose: () => void;
}

type Status =
  | 'idle'
  | 'fetching'
  | 'checking-duplicates'
  | 'refetching'
  | 'done'
  | 'error';

export const KiVocabPrototype: React.FC<KiVocabPrototypeProps> = ({ onClose }) => {
  const [count, setCount] = useState<number>(5);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [missingCount, setMissingCount] = useState<number>(0);

  // Hole den aktuellen Vokabelbestand
  const { vocabulary: existingVocabulary, isLoading: vocabLoading } = useVocabularyManager();

  // Simulierte Statuswechsel für Testzwecke
  const simulateStatus = (newStatus: Status) => {
    setStatus(newStatus);
    if (newStatus === 'error') {
      setError('Dies ist eine simulierte Fehlermeldung.');
    } else {
      setError(null);
    }
  };

  const handleGenerate = async () => {
    setStatus('fetching');
    setError(null);
    setDuplicateCount(0);
    setMissingCount(0);
    try {
      const response = await fetch('/api/prototype/generate-vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setStatus('error');
        throw new Error(errorData.error || 'Fehler bei der Generierung');
      }

      const data = await response.json();
      setStatus('checking-duplicates');
      // Duplikatprüfung (1:1 auf Kanji und Kana)
      const duplicates = data.vocabularies.filter((vocab: Vocabulary) =>
        existingVocabulary.some(ev =>
          (ev.kanji && ev.kanji === vocab.japanese) ||
          (ev.kana && ev.kana === vocab.kana)
        )
      );
      const uniqueVocabs = data.vocabularies.filter((vocab: Vocabulary) =>
        !existingVocabulary.some(ev =>
          (ev.kanji && ev.kanji === vocab.japanese) ||
          (ev.kana && ev.kana === vocab.kana)
        )
      );
      setDuplicateCount(duplicates.length);
      setMissingCount(count - uniqueVocabs.length);
      setVocabularies(uniqueVocabs);
      setTimeout(() => setStatus('done'), 1000); // Simulierte Wartezeit für UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      setStatus('error');
      console.error('Fehler:', err);
    }
  };

  // UI für Statusmeldungen
  const renderStatus = () => {
    switch (status) {
      case 'fetching':
        return <div className="text-amber-700 flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></span>Vokabeln werden abgefragt...</div>;
      case 'checking-duplicates':
        return (
          <div className="text-amber-700 flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></span>Duplikate werden identifiziert...</div>
            <div className="text-xs text-stone-600">{duplicateCount} Duplikate gefunden, {missingCount} Vokabel(n) fehlen noch.</div>
          </div>
        );
      case 'refetching':
        return <div className="text-amber-700 flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></span>Ersatz für Duplikate wird abgefragt...</div>;
      case 'error':
        return <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md">{error}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-50/95 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light text-stone-700">KI Vokabel Generator</h2>
          <span className="text-xs text-stone-400 ml-2">v0.07</span>
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

          {/* Status-Feedback */}
          {renderStatus()}

          <button
            onClick={handleGenerate}
            disabled={status === 'fetching' || status === 'checking-duplicates' || status === 'refetching' || vocabLoading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'fetching' ? 'Generiere...' : 'Vokabeln generieren'}
          </button>

          {/* Test-Buttons für Statuswechsel */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={() => simulateStatus('fetching')} className="text-xs px-2 py-1 bg-amber-100 rounded">fetching</button>
            <button onClick={() => simulateStatus('checking-duplicates')} className="text-xs px-2 py-1 bg-amber-100 rounded">checking-duplicates</button>
            <button onClick={() => simulateStatus('refetching')} className="text-xs px-2 py-1 bg-amber-100 rounded">refetching</button>
            <button onClick={() => simulateStatus('done')} className="text-xs px-2 py-1 bg-amber-100 rounded">done</button>
            <button onClick={() => simulateStatus('error')} className="text-xs px-2 py-1 bg-rose-100 rounded">error</button>
            <button onClick={() => simulateStatus('idle')} className="text-xs px-2 py-1 bg-stone-100 rounded">idle</button>
          </div>

          {status === 'done' && vocabularies.length > 0 && (
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