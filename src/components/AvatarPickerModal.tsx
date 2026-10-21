import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../data/avatars';
import type { AvatarOption } from '../data/avatars';
import { X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  currentName: string;
  onSave: (name: string, avatarUrl: string) => void;
}

export const AvatarPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAvatar,
  currentName,
  onSave,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [name, setName] = useState(currentName);
  const [filter, setFilter] = useState<'all' | 'real' | 'art' | 'joke'>('all');

  if (!isOpen) return null;

  const filteredOptions = AVATAR_OPTIONS.filter((opt) => {
    if (filter === 'all') return true;
    return opt.category === filter;
  });

  const handleConfirm = () => {
    onSave(name, selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-stone-100">
              Personalizar Compañero Lobo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Nombre de tu Lobo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Colmillo Gris, Fantasma, Fenrir..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Elegir Retrato / Avatar
              </label>
              {filter === 'joke' && (
                <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ¡Easter Egg!
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-400 border border-transparent hover:bg-stone-750'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilter('real')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filter === 'real'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-400 border border-transparent hover:bg-stone-750'
                }`}
              >
                Fotografía Real
              </button>
              <button
                type="button"
                onClick={() => setFilter('art')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filter === 'art'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-400 border border-transparent hover:bg-stone-750'
                }`}
              >
                Estilos Artísticos
              </button>
              <button
                type="button"
                onClick={() => setFilter('joke')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filter === 'joke'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-400 border border-transparent hover:bg-stone-750'
                }`}
              >
                Furro Humano (Broma)
              </button>
            </div>
          </div>

          {/* Grid of Avatars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredOptions.map((opt: AvatarOption) => {
              const isSelected = selectedAvatar === opt.src;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedAvatar(opt.src)}
                  className={`relative group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]'
                      : 'border-stone-800 hover:border-stone-700 bg-stone-950/60'
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-stone-950">
                    <img
                      src={opt.src}
                      alt={opt.name}
                      onError={(e) => {
                        // Fallback image if file not yet loaded
                        (e.target as HTMLImageElement).src = '/avatars/wolf_gray.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-2.5 bg-stone-950/90">
                    <div className="text-xs font-bold text-stone-200 truncate">
                      {opt.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">
                      {opt.categoryLabel}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-end gap-3 bg-stone-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
