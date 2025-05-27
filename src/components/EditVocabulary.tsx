import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Check, Trash2 } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { VocabularyCard as VocabType } from '../types/vocabulary';

interface EditVocabularyProps {
  vocabId: string;
  onBack: () => void;
  onSuccess?: () => void;
  onDelete?: () => void;
}

export const EditVocabulary: React.FC<EditVocabularyProps> = ({
  vocabId,
  onBack,
  onSuccess,
  onDelete
}) => {
  const { getVocabularyById, updateVocabulary, deleteVocabulary, checkDuplicate, loading } = useVocabularyManager();
  
  const [formData, setFormData] = useState({
    kanji: '',
    kana: '',
    romaji: '',
    de: ''
  });
  
  const [originalVocab, setOriginalVocab] = useState<VocabType | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Vokabel laden
  useEffect(() => {
    // Warte bis die Daten geladen sind
    if (loading) return;
    
    const vocab = getVocabularyById(vocabId);
    if (vocab) {
      setOriginalVocab(vocab);
      setFormData({
        kanji: vocab.kanji,
        kana: vocab.kana,
        romaji: vocab.romaji,
        de: vocab.de
      });
      // Lösche eventuelle Load-Fehler
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.load;
        return newErrors;
      });
    } else {
      setErrors({ load: 'Vokabel nicht gefunden' });
    }
  }, [vocabId, getVocabularyById, loading]);

  // Validierung
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.kanji.trim()) {
      newErrors.kanji = 'Kanji ist erforderlich';
    }
    
    if (!formData.kana.trim()) {
      newErrors.kana = 'Kana ist erforderlich';
    }
    
    if (!formData.romaji.trim()) {
      newErrors.romaji = 'Romaji ist erforderlich';
    }
    
    if (!formData.de.trim()) {
      newErrors.de = 'Deutsche Übersetzung ist erforderlich';
    }
    
    // Duplikat-Prüfung (außer für die aktuelle Vokabel)
    if (formData.kanji.trim() || formData.kana.trim() || formData.romaji.trim()) {
      if (checkDuplicate(formData.kanji.trim(), formData.kana.trim(), formData.romaji.trim(), vocabId)) {
        newErrors.duplicate = 'Eine andere Vokabel mit diesen Werten existiert bereits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedVocab = updateVocabulary(vocabId, {
        kanji: formData.kanji.trim(),
        kana: formData.kana.trim(),
        romaji: formData.romaji.trim(),
        de: formData.de.trim()
      });
      
      console.log('Vokabel aktualisiert:', updatedVocab);
      
      // Erfolg anzeigen
      setShowSuccess(true);
      
      // Nach 2 Sekunden ausblenden
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      setErrors({ submit: 'Fehler beim Speichern der Änderungen' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Löschen bestätigen
  const handleDelete = () => {
    try {
      deleteVocabulary(vocabId);
      console.log('Vokabel gelöscht:', vocabId);
      
      if (onDelete) {
        onDelete();
      }
      onBack();
      
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setErrors({ delete: 'Fehler beim Löschen der Vokabel' });
    }
  };

  // Input-Handler
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Fehler für dieses Feld löschen
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Prüfen ob Änderungen vorliegen
  const hasChanges = originalVocab && (
    formData.kanji !== originalVocab.kanji ||
    formData.kana !== originalVocab.kana ||
    formData.romaji !== originalVocab.romaji ||
    formData.de !== originalVocab.de
  );

  // Loading-Zustand anzeigen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Vokabel...</p>
        </div>
      </div>
    );
  }

  if (errors.load) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Fehler</p>
          <p>{errors.load}</p>
          <button
            onClick={onBack}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold">Vokabel bearbeiten</h1>
          </div>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Vokabel löschen"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          <div className="flex items-center">
            <Check className="mr-2" size={20} />
            <span>Änderungen erfolgreich gespeichert!</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Vokabel löschen?</h3>
            <p className="text-gray-600 mb-6">
              Möchtest du diese Vokabel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kanji */}
          <div>
            <label htmlFor="kanji" className="block text-sm font-medium text-gray-700 mb-2">
              Kanji *
            </label>
            <input
              id="kanji"
              type="text"
              value={formData.kanji}
              onChange={(e) => handleInputChange('kanji', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl ${
                errors.kanji ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.kanji && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.kanji}
              </p>
            )}
          </div>

          {/* Kana */}
          <div>
            <label htmlFor="kana" className="block text-sm font-medium text-gray-700 mb-2">
              Kana (Hiragana/Katakana) *
            </label>
            <input
              id="kana"
              type="text"
              value={formData.kana}
              onChange={(e) => handleInputChange('kana', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                errors.kana ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.kana && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.kana}
              </p>
            )}
          </div>

          {/* Romaji */}
          <div>
            <label htmlFor="romaji" className="block text-sm font-medium text-gray-700 mb-2">
              Romaji *
            </label>
            <input
              id="romaji"
              type="text"
              value={formData.romaji}
              onChange={(e) => handleInputChange('romaji', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.romaji ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.romaji && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.romaji}
              </p>
            )}
          </div>

          {/* Deutsch */}
          <div>
            <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-2">
              Deutsche Übersetzung *
            </label>
            <input
              id="de"
              type="text"
              value={formData.de}
              onChange={(e) => handleInputChange('de', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.de ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.de && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.de}
              </p>
            )}
          </div>

          {/* Duplikat-Fehler */}
          {errors.duplicate && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{errors.duplicate}</span>
              </div>
            </div>
          )}

          {/* Submit-Fehler */}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2" size={20} />
                {hasChanges ? 'Änderungen speichern' : 'Keine Änderungen'}
              </>
            )}
          </button>
        </form>

        {/* SM-2 Info */}
        {originalVocab && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">SM-2 Statistiken:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Wiederholungen: {originalVocab.sm2.repetitions}</div>
              <div>Intervall: {originalVocab.sm2.interval} Tag{originalVocab.sm2.interval !== 1 ? 'e' : ''}</div>
              <div>Schwierigkeitsfaktor: {originalVocab.sm2.easeFactor.toFixed(2)}</div>
              {originalVocab.sm2.lastReview && (
                <div>Letzte Wiederholung: {new Date(originalVocab.sm2.lastReview).toLocaleDateString('de-DE')}</div>
              )}
              {originalVocab.sm2.nextReview && (
                <div>Nächste Wiederholung: {new Date(originalVocab.sm2.nextReview).toLocaleDateString('de-DE')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 