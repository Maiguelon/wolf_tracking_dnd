import React from 'react';
import type { SavingThrows, SavingThrowPips } from '../types/wolf';
import { Sparkles, Utensils } from 'lucide-react';

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
  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
            Tiradas de Salvación
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Utensils className="w-3 h-3" />
          <span>Comida especial: <strong>{specialFoodCount}</strong></span>
        </div>
      </div>

      <p className="text-xs text-stone-400 mb-4">
        Cada ración de comida especial rellena 1 punto y otorga +1 permanente a la salvación (máx. 5).
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
              className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3 flex flex-col items-center justify-between hover:border-stone-700 transition group relative"
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
  );
};
