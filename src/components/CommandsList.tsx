import React from 'react';
import type { CalculatedWolfStats } from '../types/wolf';
import { Crown, Sparkles, MessageSquareCode, ShieldAlert } from 'lucide-react';

interface Props {
  stats: CalculatedWolfStats;
}

export const CommandsList: React.FC<Props> = ({ stats }) => {
  const hasCommands = stats.commands.length > 0;
  const hasSpells = stats.spellsAndDaily.length > 0;
  const hasPassives = stats.passives.length > 0;
  const hasApex = stats.apexSkills.length > 0;

  return (
    <div className="space-y-4">
      {/* Apex Skills (if any unlocked) */}
      {hasApex && (
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-stone-900/40 border border-amber-500/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider">
              Habilidades Apex Desbloqueadas
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stats.apexSkills.map((apex, i) => (
              <div
                key={i}
                className="bg-stone-950/80 border border-amber-500/30 rounded-xl p-3"
              >
                <div className="text-sm font-bold text-amber-300">{apex.name}</div>
                <div className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {apex.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commands (Bonus Actions) */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              Comandos Entrenados (Acción Adicional)
            </h4>
          </div>
          <span className="text-[11px] text-stone-500">
            Usas tu Acción Adicional para ordenar
          </span>
        </div>

        {hasCommands ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stats.commands.map((cmd, i) => (
              <div
                key={i}
                className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-emerald-300">{cmd.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    {cmd.actionType}
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{cmd.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic py-2">
            El lobo aún no ha aprendido comandos de acción adicional (aprende Carrera, Esquiva, Empuje, etc. en el árbol de habilidades).
          </p>
        )}
      </div>

      {/* Spells & Daily/Weekly abilities */}
      {hasSpells && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              Conjuros y Habilidades Diarias / Semanales
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stats.spellsAndDaily.map((ability, i) => (
              <div
                key={i}
                className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-purple-300">{ability.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">
                    {ability.frequency}
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{ability.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passives & Utilities */}
      {hasPassives && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              Rasgos Pasivos y Utilidades
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stats.passives.map((passive, i) => (
              <div
                key={i}
                className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 hover:border-sky-500/30 transition"
              >
                <span className="text-sm font-bold text-sky-300 block mb-1">
                  {passive.name}
                </span>
                <p className="text-xs text-stone-400 leading-relaxed">{passive.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
