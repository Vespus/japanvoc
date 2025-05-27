import React, { useState } from 'react';
import { Search, ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { VocabularyCard as VocabType } from '../types/vocabulary';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { useSearch } from '../hooks/useSearch';

interface VocabularySearchProps {
  onBack: () => void;
  onEditVocab: (vocab: VocabType) => void;
  onDeleteVocab: (vocab: VocabType) => void;
}

export const VocabularySearch: React.FC<VocabularySearchProps> = ({
  onBack,
  onEditVocab,
  onDeleteVocab
}) => {
  const { vocabulary, loading, error, deleteVocabulary } = useVocabularyManager();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    highlightMatch,
    isSearching,
    hasResults,
    resultCount
  } = useSearch(vocabulary);

  // Löschen bestätigen
  const handleDeleteConfirm = (vocab: VocabType) => {
    setShowDeleteConfirm(vocab.id);
  };

  const handleDeleteExecute = () => {
    if (showDeleteConfirm) {
      deleteVocabulary(showDeleteConfirm);
      setShowDeleteConfirm(null);
      onDeleteVocab(vocabulary.find(v => v.id === showDeleteConfirm)!);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin" size={48} />
          <p className="text-gray-600">Lade Vokabeln...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Fehler</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Vokabeln suchen</h1>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Suche nach Kanji, Kana, Romaji oder Deutsch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={16} />
          )}
        </div>
        
        {/* Results Count */}
        <div className="text-center mt-3 text-sm text-gray-600">
          {searchTerm ? (
            <span>
              {resultCount} Ergebnis{resultCount !== 1 ? 'se' : ''} 
              {searchTerm && ` für "${searchTerm}"`}
            </span>
          ) : (
            <span>{vocabulary.length} Vokabeln verfügbar</span>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {hasResults ? (
          <div className="space-y-3">
            {searchResults.map((vocab) => (
              <VocabularyCard
                key={vocab.id}
                vocab={vocab}
                searchTerm={searchTerm}
                highlightMatch={highlightMatch}
                onEdit={() => onEditVocab(vocab)}
                onDelete={() => handleDeleteConfirm(vocab)}
              />
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <Search className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 text-lg">Keine Ergebnisse gefunden</p>
            <p className="text-gray-500 text-sm mt-2">
              Versuche einen anderen Suchbegriff
            </p>
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Vokabel löschen?</h3>
            <p className="text-gray-600 mb-6">
              Möchtest du diese Vokabel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteExecute}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Einzelne Vokabelkarte in den Suchergebnissen
interface VocabularyCardProps {
  vocab: VocabType;
  searchTerm: string;
  highlightMatch: (text: string, searchTerm: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocab,
  searchTerm,
  highlightMatch,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Japanisch */}
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              <span dangerouslySetInnerHTML={{ 
                __html: highlightMatch(vocab.kanji, searchTerm) 
              }} />
            </div>
            <div className="text-lg text-gray-700">
              <span dangerouslySetInnerHTML={{ 
                __html: highlightMatch(vocab.kana, searchTerm) 
              }} />
            </div>
            <div className="text-sm text-gray-500">
              <span dangerouslySetInnerHTML={{ 
                __html: highlightMatch(vocab.romaji, searchTerm) 
              }} />
            </div>
          </div>
          
          {/* Deutsch */}
          <div className="text-lg text-blue-600 font-medium">
            <span dangerouslySetInnerHTML={{ 
              __html: highlightMatch(vocab.de, searchTerm) 
            }} />
          </div>
          
          {/* SM-2 Info */}
          <div className="mt-2 text-xs text-gray-400">
            Wiederholungen: {vocab.sm2.repetitions} • 
            Intervall: {vocab.sm2.interval} Tag{vocab.sm2.interval !== 1 ? 'e' : ''}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Bearbeiten"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Löschen"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}; 