import React, { useState } from 'react';
import type { SavingThrows, SavingThrowPips } from '../types/wolf';
import { Sparkles, Utensils, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  savingThrows: SavingThrows;
  pips: SavingThrowPips;
  specialFoodCount: number;
  onFeed?: (stat: keyof SavingThrowPips) => void;
  canFeed?: boolean;
}

interface StatConfig {
  key: keyof SavingThrowPips;
  label: string;
  nameEs: string;
  base: number;
}

const STATS_CONFIG: StatConfig[] = [
  { key: 'str', label: 'FUE', nameEs: 'Fuerza', base: 0 },
  { key: 'dex', label: 'DES', nameEs: 'Destreza', base: 1 },
  { key: 'con', label: 'CON', nameEs: 'Constitución', base: 0 },
  { key: 'int', label: 'INT', nameEs: 'Inteligencia', base: -4 },
  { key: 'wis', label: 'SAB', nameEs: 'Sabiduría', base: 1 },
  { key: 'cha', label: 'CAR', nameEs: 'Carisma', base: -2 },
];

export const SavingThrowDisplay: React.FC<Props> = ({
  savingThrows,
  pips,
  specialFoodCount,
  onFeed,
  canFeed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-3xl shadow-lg backdrop-blur-sm overflow-hidden transition-all">
      {/* Clickable Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-850/50 transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">
              Tiradas de Salvación
            </h3>
            <p className="text-[11px] text-stone-400">
              Mejoradas con raciones de comida especial (+1 permanente cada una)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick inline badges when collapsed or expanded */}
          <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
            <Utensils className="w-3.5 h-3.5" />
            <span>Comida: <strong>{specialFoodCount}</strong></span>
          </div>

          <div className="p-1 rounded-lg text-stone-400 hover:text-stone-200 transition">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {/* Collapsed Compact Summary Preview */}
      {!isExpanded && (
        <div className="px-5 pb-4 -mt-1 flex flex-wrap gap-2 text-xs">
          {STATS_CONFIG.map(({ key, label }) => {
            const bonus = savingThrows[key];
            const formatted = bonus >= 0 ? `+${bonus}` : `${bonus}`;
            return (
              <span
                key={key}
                className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 font-mono text-stone-300"
              >
                <strong className="text-stone-400">{label}:</strong> {formatted}
              </span>
            );
          })}
        </div>
      )}

      {/* Expanded Full Grid Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-stone-800/60 animate-fadeIn">
          <p className="text-xs text-stone-400 my-3">
            Cada ración de comida especial rellena 1 casilla y otorga +1 permanente a la tirada de salvación (máx. 5 por atributo).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {STATS_CONFIG.map(({ key, label, nameEs }) => {
              const bonus = savingThrows[key];
              const currentPips = pips[key] || 0;
              const formattedBonus = bonus >= 0 ? `+${bonus}` : `${bonus}`;
              const isMaxed = currentPips >= 5;
              const ableToFeed = canFeed && !isMaxed && specialFoodCount > 0;

              return (
                <div
                  key={key}
                  className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3 flex flex-col items-center justify-between hover:border-stone-700 transition group relative"
                >
                  <div className="text-center w-full">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block">
                      {label}
                    </span>
                    <span className="text-[10px] text-stone-500 block -mt-0.5 truncate">
                      {nameEs}
                    </span>
                  </div>

                  <div className="my-1.5 text-xl font-black text-amber-300 font-mono">
                    {formattedBonus}
                  </div>

                  {/* 5 Pips for special food */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i < currentPips
                            ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                            : 'bg-stone-800 border border-stone-700'
                        }`}
                      />
                    ))}
                  </div>

                  {onFeed && (
                    <button
                      type="button"
                      disabled={!ableToFeed}
                      onClick={() => onFeed(key)}
                      className={`w-full py-1 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 transition ${
                        ableToFeed
                          ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 hover:bg-amber-600/50 cursor-pointer active:scale-95'
                          : isMaxed
                          ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 cursor-default'
                          : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        isMaxed
                          ? 'Alcanzó el máximo de 5 mejoras'
                          : specialFoodCount <= 0
                          ? 'Sin comida especial en inventario'
                          : `Alimentar para mejorar ${nameEs}`
                      }
                    >
                      <Utensils className="w-2.5 h-2.5" />
                      {isMaxed ? 'Máx' : '+1'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
