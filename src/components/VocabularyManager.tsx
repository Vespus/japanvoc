import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { VocabularyCard } from '../types/vocabulary';
import { AddVocabulary } from './AddVocabulary';
import { EditVocabulary } from './EditVocabulary';

interface VocabularyManagerProps {
  onBack: () => void;
}

export const VocabularyManager: React.FC<VocabularyManagerProps> = ({ onBack }) => {
  const { vocabulary, deleteVocabulary, isLoading } = useVocabularyManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingVocab, setEditingVocab] = useState<VocabularyCard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Vokabeln filtern
  const filteredVocabulary = vocabulary.filter(vocab => {
    const query = searchQuery.toLowerCase();
    return (
      vocab.it.toLowerCase().includes(query) ||
      vocab.de.toLowerCase().includes(query) ||
      vocab.notes.toLowerCase().includes(query) ||
      vocab.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Vokabel löschen
  const handleDelete = (id: string) => {
    if (deleteVocabulary(id)) {
      setShowDeleteConfirm(null);
    }
  };

  if (showAdd) {
    return <AddVocabulary onBack={() => setShowAdd(false)} />;
  }

  if (editingVocab) {
    return <EditVocabulary vocab={editingVocab} onBack={() => setEditingVocab(null)} />;
  }

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
            <h1 className="text-2xl font-light text-stone-800 tracking-wide">Vokabeln</h1>
            <button
              onClick={() => setShowAdd(true)}
              className="p-2 hover:bg-amber-100 rounded-xl transition-all"
            >
              <Plus size={20} className="text-amber-700" />
            </button>
          </div>

          {/* Suchleiste */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vokabeln suchen..."
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-light"
            />
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" />
          </div>

          {/* Vokabelliste */}
          <div className="space-y-4">
            {filteredVocabulary.map((vocab) => (
              <div
                key={vocab.id}
                className="bg-gradient-to-br from-white to-amber-50 border border-amber-200/60 rounded-2xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-lg font-light text-stone-800 tracking-wide">
                      {vocab.it}
                    </div>
                    <div className="text-amber-700 font-light">
                      {vocab.de}
                    </div>
                    {vocab.notes && (
                      <div className="text-sm text-stone-600 font-light mt-1">
                        {vocab.notes}
                      </div>
                    )}
                    {vocab.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {vocab.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-light"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setEditingVocab(vocab)}
                      className="p-2 hover:bg-amber-100 rounded-xl transition-all"
                    >
                      <Edit2 size={16} className="text-amber-700" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(vocab.id)}
                      className="p-2 hover:bg-rose-100 rounded-xl transition-all"
                    >
                      <Trash2 size={16} className="text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Löschbestätigung */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
                <h3 className="text-lg font-light text-stone-800 mb-4">
                  Vokabel löschen?
                </h3>
                <p className="text-stone-600 font-light mb-6">
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-2 bg-stone-200 text-stone-700 rounded-xl font-light hover:bg-stone-300 transition-all"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 py-2 bg-rose-500 text-white rounded-xl font-light hover:bg-rose-600 transition-all"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 