import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';

interface AddVocabularyProps {
  onBack: () => void;
}

export const AddVocabulary: React.FC<AddVocabularyProps> = ({ onBack }) => {
  const { addVocabulary } = useVocabularyManager();
  const [formData, setFormData] = useState({
    it: '',
    de: '',
    notes: '',
    tags: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validierung
    if (!formData.it.trim() || !formData.de.trim()) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    try {
      // Tags in Array umwandeln
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Neue Vokabel hinzufügen
      addVocabulary({
        it: formData.it.trim(),
        de: formData.de.trim(),
        notes: formData.notes.trim(),
        tags
      });

      // Formular zurücksetzen
      setFormData({
        it: '',
        de: '',
        notes: '',
        tags: ''
      });

      // Zurück zur Vokabelliste
      onBack();
    } catch (err) {
      setError('Fehler beim Hinzufügen der Vokabel.');
      console.error('Fehler beim Hinzufügen:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-stone-100 rounded-xl transition-all"
            >
              <ArrowLeft size={20} className="text-stone-700" />
            </button>
            <h1 className="text-2xl font-light text-stone-800 tracking-wide">Neue Vokabel</h1>
            <div style={{ width: 40 }} />
          </div>

          {/* Formular */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Italienisch */}
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                Italienisch *
              </label>
              <input
                type="text"
                value={formData.it}
                onChange={(e) => setFormData(prev => ({ ...prev, it: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light"
                placeholder="Italienische Vokabel"
              />
            </div>

            {/* Deutsch */}
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                Deutsch *
              </label>
              <input
                type="text"
                value={formData.de}
                onChange={(e) => setFormData(prev => ({ ...prev, de: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light"
                placeholder="Deutsche Übersetzung"
              />
            </div>

            {/* Notizen */}
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                Notizen
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light resize-none"
                placeholder="Optionale Notizen oder Beispiele"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light"
                placeholder="Tags durch Komma getrennt (z.B. Verb, Nomen, ...)"
              />
            </div>

            {/* Fehlermeldung */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl font-light">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-stone-700 text-white rounded-2xl shadow-lg font-light text-lg hover:from-amber-700 hover:to-stone-800 transition-all"
            >
              <Save size={20} />
              Vokabel speichern
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 