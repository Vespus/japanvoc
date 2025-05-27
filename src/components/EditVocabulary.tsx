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
  const { getVocabularyById, updateVocabulary, deleteVocabulary, checkDuplicate, isLoading } = useVocabularyManager();
  
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
    if (isLoading) return;
    
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
  }, [vocabId, getVocabularyById, isLoading]);

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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-stone-600 font-light">Lade Vokabel...</p>
        </div>
      </div>
    );
  }

  if (errors.load) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-r from-rose-100 to-rose-200 border border-rose-300/60 text-rose-800 px-6 py-4 rounded-3xl max-w-md shadow-lg">
          <p className="font-light text-lg mb-2">Fehler</p>
          <p className="font-light mb-4">{errors.load}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 font-light tracking-wide"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-700 via-amber-800 to-stone-800 text-amber-50 shadow-2xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-stone-700/50 rounded-xl transition-all duration-300"
            >
              <ArrowLeft size={24} className="text-amber-50 opacity-90" />
            </button>
            <h1 className="text-xl font-extralight tracking-widest">Vokabel bearbeiten</h1>
          </div>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all duration-300"
            title="Vokabel löschen"
          >
            <Trash2 size={20} className="opacity-90" />
          </button>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 border border-teal-300/60 text-teal-800 px-4 py-3 mx-4 mt-4 rounded-2xl shadow-lg">
          <div className="flex items-center font-light">
            <Check className="mr-2 opacity-80" size={20} />
            <span>Änderungen erfolgreich gespeichert!</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl p-6 max-w-sm w-full border border-amber-200/50 shadow-2xl">
            <h3 className="text-lg font-light text-stone-800 mb-4 tracking-wide">Vokabel löschen?</h3>
            <p className="text-stone-600 mb-6 font-light leading-relaxed">
              Möchtest du diese Vokabel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-all duration-300 font-light tracking-wide"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 font-light tracking-wide shadow-lg"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl border border-amber-300/60 shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kanji */}
          <div>
            <label htmlFor="kanji" className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Kanji *
            </label>
            <input
              id="kanji"
              type="text"
              value={formData.kanji}
              onChange={(e) => handleInputChange('kanji', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-2xl font-light bg-white/80 backdrop-blur-sm ${
                errors.kanji ? 'border-rose-400' : 'border-stone-300/60'
              }`}
              style={{ fontFamily: 'serif' }}
            />
            {errors.kanji && (
              <p className="mt-2 text-sm text-rose-600 flex items-center font-light">
                <AlertCircle size={16} className="mr-1 opacity-80" />
                {errors.kanji}
              </p>
            )}
          </div>

          {/* Kana */}
          <div>
            <label htmlFor="kana" className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Kana (Hiragana/Katakana) *
            </label>
            <input
              id="kana"
              type="text"
              value={formData.kana}
              onChange={(e) => handleInputChange('kana', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-light bg-white/80 backdrop-blur-sm ${
                errors.kana ? 'border-rose-400' : 'border-stone-300/60'
              }`}
            />
            {errors.kana && (
              <p className="mt-2 text-sm text-rose-600 flex items-center font-light">
                <AlertCircle size={16} className="mr-1 opacity-80" />
                {errors.kana}
              </p>
            )}
          </div>

          {/* Romaji */}
          <div>
            <label htmlFor="romaji" className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Romaji *
            </label>
            <input
              id="romaji"
              type="text"
              value={formData.romaji}
              onChange={(e) => handleInputChange('romaji', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light bg-white/80 backdrop-blur-sm tracking-wide ${
                errors.romaji ? 'border-rose-400' : 'border-stone-300/60'
              }`}
            />
            {errors.romaji && (
              <p className="mt-2 text-sm text-rose-600 flex items-center font-light">
                <AlertCircle size={16} className="mr-1 opacity-80" />
                {errors.romaji}
              </p>
            )}
          </div>

          {/* Deutsch */}
          <div>
            <label htmlFor="de" className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Deutsche Übersetzung *
            </label>
            <input
              id="de"
              type="text"
              value={formData.de}
              onChange={(e) => handleInputChange('de', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light bg-white/80 backdrop-blur-sm tracking-wide ${
                errors.de ? 'border-rose-400' : 'border-stone-300/60'
              }`}
            />
            {errors.de && (
              <p className="mt-2 text-sm text-rose-600 flex items-center font-light">
                <AlertCircle size={16} className="mr-1 opacity-80" />
                {errors.de}
              </p>
            )}
          </div>

          {/* Duplikat-Fehler */}
          {errors.duplicate && (
            <div className="bg-gradient-to-r from-rose-100 to-rose-200 border border-rose-300/60 text-rose-800 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center font-light">
                <AlertCircle className="mr-2 opacity-80" size={20} />
                <span>{errors.duplicate}</span>
              </div>
            </div>
          )}

          {/* Submit-Fehler */}
          {errors.submit && (
            <div className="bg-gradient-to-r from-rose-100 to-rose-200 border border-rose-300/60 text-rose-800 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center font-light">
                <AlertCircle className="mr-2 opacity-80" size={20} />
                <span>{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-stone-400 disabled:to-stone-500 text-white font-light py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg tracking-wide"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 opacity-80"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 opacity-90" size={20} />
                {hasChanges ? 'Änderungen speichern' : 'Keine Änderungen'}
              </>
            )}
          </button>
        </form>
        </div>

        {/* SM-2 Info */}
        {originalVocab && (
          <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/60 rounded-3xl shadow-sm">
            <h3 className="font-light text-amber-800 mb-3 tracking-wide">SM-2 Statistiken:</h3>
            <div className="text-sm text-amber-700 space-y-2 font-light leading-relaxed">
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