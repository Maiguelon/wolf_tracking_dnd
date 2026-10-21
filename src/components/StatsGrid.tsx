import React from 'react';
import type { CalculatedWolfStats } from '../types/wolf';
import { Shield, Heart, Wind, Zap, Eye, Ghost, Sparkles } from 'lucide-react';

interface Props {
  stats: CalculatedWolfStats;
}

export const StatsGrid: React.FC<Props> = ({ stats }) => {
  return (
    <div className="space-y-3">
      {/* 4 Main Combat/Mobility Vitals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Armor Class */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-amber-500/30 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Clase Armadura
            </div>
            <div className="text-2xl font-black text-stone-100 font-mono">
              {stats.ac} <span className="text-xs text-stone-400 font-normal">CA</span>
            </div>
          </div>
        </div>

        {/* Hit Points */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-red-500/30 transition">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Puntos Golpe
            </div>
            <div className="text-2xl font-black text-stone-100 font-mono">
              {stats.maxHp} <span className="text-xs text-stone-400 font-normal">PG</span>
            </div>
          </div>
        </div>

        {/* Speed & Jump */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-emerald-500/30 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Velocidad
            </div>
            <div className="text-2xl font-black text-stone-100 font-mono">
              {stats.speed} <span className="text-xs text-stone-400 font-normal">pies</span>
            </div>
            {stats.jump > 0 && (
              <div className="text-[10px] text-emerald-400">
                Salto: +{stats.jump} pies
              </div>
            )}
          </div>
        </div>

        {/* Bite Extra Damage */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-orange-500/30 transition">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Mordisco Extra
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {stats.biteDamage ? (
                <>+{stats.biteDamage}</>
              ) : (
                <span className="text-sm font-normal text-stone-500">Base</span>
              )}
            </div>
            <div className="text-[10px] text-stone-500">1/turno (a 5 pies)</div>
          </div>
        </div>
      </div>

      {/* Secondary Skill Bonuses Bar */}
      {(stats.perceptionBonus > 0 ||
        stats.stealthBonus > 0 ||
        stats.performanceBonus > 0 ||
        stats.survivalBonusDie ||
        stats.wisdomSaveBonusDie) && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Bonos Activos:
          </span>

          {stats.perceptionBonus > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              Percepción: <strong>+{stats.perceptionBonus}</strong>
            </span>
          )}

          {stats.stealthBonus > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200">
              <Ghost className="w-3.5 h-3.5 text-indigo-400" />
              Sigilo: <strong>+{stats.stealthBonus}</strong>
            </span>
          )}

          {stats.performanceBonus > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Interpretación: <strong>+{stats.performanceBonus}</strong>
            </span>
          )}

          {stats.survivalBonusDie && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200">
              Rastreo: <strong>+1{stats.survivalBonusDie}</strong>
            </span>
          )}

          {stats.wisdomSaveBonusDie && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200">
              1ª Salv. Sabiduría: <strong>+1{stats.wisdomSaveBonusDie}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
