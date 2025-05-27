import React, { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Check } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';

interface AddVocabularyProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const AddVocabulary: React.FC<AddVocabularyProps> = ({
  onBack,
  onSuccess
}) => {
  const { addVocabulary, checkDuplicate } = useVocabularyManager();
  
  const [formData, setFormData] = useState({
    kanji: '',
    kana: '',
    romaji: '',
    de: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    
    // Duplikat-Prüfung
    if (formData.kanji.trim() || formData.kana.trim() || formData.romaji.trim()) {
      if (checkDuplicate(formData.kanji.trim(), formData.kana.trim(), formData.romaji.trim())) {
        newErrors.duplicate = 'Eine Vokabel mit diesen Werten existiert bereits';
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
      const newVocab = addVocabulary({
        kanji: formData.kanji.trim(),
        kana: formData.kana.trim(),
        romaji: formData.romaji.trim(),
        de: formData.de.trim()
      });
      
      console.log('Neue Vokabel erstellt:', newVocab);
      
      // Erfolg anzeigen
      setShowSuccess(true);
      
      // Formular zurücksetzen
      setFormData({
        kanji: '',
        kana: '',
        romaji: '',
        de: ''
      });
      
      // Nach 2 Sekunden ausblenden
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      setErrors({ submit: 'Fehler beim Speichern der Vokabel' });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-700 via-amber-800 to-stone-800 text-amber-50 shadow-2xl">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-stone-700/50 rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={24} className="text-amber-50 opacity-90" />
          </button>
          <h1 className="text-xl font-extralight tracking-widest">Neue Vokabel hinzufügen</h1>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 border border-teal-300/60 text-teal-800 px-4 py-3 mx-4 mt-4 rounded-2xl shadow-lg">
          <div className="flex items-center font-light">
            <Check className="mr-2 opacity-80" size={20} />
            <span>Vokabel erfolgreich hinzugefügt!</span>
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
                placeholder="例: 犬"
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
                placeholder="例: いぬ"
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
                placeholder="例: inu"
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
                placeholder="例: Hund"
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
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-amber-400 disabled:to-amber-500 text-white font-light py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 opacity-80"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 opacity-90" size={20} />
                  Vokabel speichern
                </>
              )}
            </button>
          </form>
        </div>

        {/* Hinweise */}
        <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/60 rounded-3xl shadow-sm">
          <h3 className="font-light text-amber-800 mb-3 tracking-wide">Hinweise:</h3>
          <ul className="text-sm text-amber-700 space-y-2 font-light leading-relaxed">
            <li>• Alle Felder sind erforderlich</li>
            <li>• Duplikate werden automatisch erkannt</li>
            <li>• Die Vokabel wird mit SM-2 Standard-Werten erstellt</li>
            <li>• Daten werden lokal gespeichert</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 