import React, { useState, useEffect } from 'react';
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
  const normalizedInitial = currentAvatar ? currentAvatar.replace(/\.jpg$/, '.png') : '/avatars/wolf_gray.png';
  const [selectedAvatar, setSelectedAvatar] = useState(normalizedInitial);
  const [name, setName] = useState(currentName);
  const [filter, setFilter] = useState<'all' | 'real' | 'art' | 'joke'>('all');

  // Always sync local state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const normalized = currentAvatar ? currentAvatar.replace(/\.jpg$/, '.png') : '/avatars/wolf_gray.png';
      setSelectedAvatar(normalized);
      setName(currentName);
    }
  }, [isOpen, currentAvatar, currentName]);

  if (!isOpen) return null;

  const filteredOptions = AVATAR_OPTIONS.filter((opt) => {
    if (filter === 'all') return true;
    return opt.category === filter;
  });

  const handleConfirm = () => {
    onSave(name.trim() || currentName, selectedAvatar);
    onClose();
  };

  const handleInstantSelect = (avatarSrc: string) => {
    setSelectedAvatar(avatarSrc);
    // Auto-save immediately with the new avatar and current name
    onSave(name.trim() || currentName, avatarSrc);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Personalizar Compañero Lobo
              </h3>
              <p className="text-[11px] text-stone-400">
                Haz clic en una imagen para seleccionarla al instante
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
        >
          {/* Name input */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Nombre de tu Lobo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Colmillo Gris, Fantasma, Fenrir..."
                className="flex-1 bg-stone-900 border border-stone-700/80 rounded-xl px-3.5 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 transition cursor-pointer"
              >
                Aplicar Nombre
              </button>
            </div>
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

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-950 text-stone-400 border border-stone-800 hover:bg-stone-800'
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
                    : 'bg-stone-950 text-stone-400 border border-stone-800 hover:bg-stone-800'
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
                    : 'bg-stone-950 text-stone-400 border border-stone-800 hover:bg-stone-800'
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
                    : 'bg-stone-950 text-stone-400 border border-stone-800 hover:bg-stone-800'
                }`}
              >
                Furro (Broma)
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
                  onClick={() => handleInstantSelect(opt.src)}
                  className={`relative group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.02] bg-amber-950/20'
                      : 'border-stone-800 hover:border-stone-600 bg-stone-950/60'
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-stone-950 relative">
                    <img
                      src={opt.src}
                      alt={opt.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/wolf_gray.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-stone-950/90 flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-xs font-bold text-stone-200 truncate">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate mt-0.5">
                        {opt.categoryLabel}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-stone-800/60 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg block ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-900 text-stone-400 group-hover:text-stone-200'
                        }`}
                      >
                        {isSelected ? 'Seleccionado' : 'Elegir'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between gap-3 bg-stone-950/80 shrink-0">
          <div className="text-xs text-stone-400 truncate">
            {selectedAvatar ? 'Foto seleccionada' : 'Elige una foto'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar y Salir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
