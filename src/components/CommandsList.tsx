import React, { useState } from 'react';
import type { CalculatedWolfStats } from '../types/wolf';
import {
  Crown,
  Sparkles,
  MessageSquareCode,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  stats: CalculatedWolfStats;
}

export const CommandsList: React.FC<Props> = ({ stats }) => {
  const [expandCommands, setExpandCommands] = useState(true);
  const [expandSpells, setExpandSpells] = useState(true);
  const [expandPassives, setExpandPassives] = useState(true);

  const hasCommands = stats.commands.length > 0;
  const hasSpells = stats.spellsAndDaily.length > 0;
  const hasPassives = stats.passives.length > 0;
  const hasApex = stats.apexSkills.length > 0;

  return (
    <div className="space-y-4">
      {/* Apex Skills (if any unlocked) */}
      {hasApex && (
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-stone-900/40 border border-amber-500/40 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider">
              Habilidades Apex Desbloqueadas ({stats.apexSkills.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stats.apexSkills.map((apex, i) => (
              <div
                key={i}
                className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-3.5"
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

      {/* Commands (Bonus Actions) - Collapsible Accordion */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl shadow-lg overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setExpandCommands(!expandCommands)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-850/50 transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquareCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                  Comandos Entrenados (Acción Adicional)
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-stone-950 text-emerald-400 border border-emerald-800/40">
                  {stats.commands.length}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Usas tu Acción Adicional para ordenar estas tácticas
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg text-stone-400 hover:text-stone-200 transition">
            {expandCommands ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {expandCommands && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-800/60 animate-fadeIn">
            {hasCommands ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {stats.commands.map((cmd, i) => (
                  <div
                    key={i}
                    className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3.5 hover:border-emerald-500/30 transition"
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
              <p className="text-xs text-stone-500 italic py-3">
                El lobo aún no ha aprendido comandos de acción adicional (aprende Carrera, Esquiva, Empuje, etc. en la pestaña de Mejoras).
              </p>
            )}
          </div>
        )}
      </div>

      {/* Spells & Daily/Weekly abilities - Collapsible Accordion */}
      {hasSpells && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl shadow-lg overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setExpandSpells(!expandSpells)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-850/50 transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Conjuros y Habilidades Diarias / Semanales
                  </h4>
                  <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-stone-950 text-purple-400 border border-purple-800/40">
                    {stats.spellsAndDaily.length}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Habilidades con recarga de descanso o límites de uso
                </p>
              </div>
            </div>

            <div className="p-1 rounded-lg text-stone-400 hover:text-stone-200 transition">
              {expandSpells ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {expandSpells && (
            <div className="p-4 sm:p-5 pt-0 border-t border-stone-800/60 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {stats.spellsAndDaily.map((ability, i) => (
                  <div
                    key={i}
                    className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3.5 hover:border-purple-500/30 transition"
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
        </div>
      )}

      {/* Passives & Utilities - Collapsible Accordion */}
      {hasPassives && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl shadow-lg overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setExpandPassives(!expandPassives)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-850/50 transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    Rasgos Pasivos y Utilidades
                  </h4>
                  <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-stone-950 text-sky-400 border border-sky-800/40">
                    {stats.passives.length}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Efectos continuos y habilidades pasivas activas
                </p>
              </div>
            </div>

            <div className="p-1 rounded-lg text-stone-400 hover:text-stone-200 transition">
              {expandPassives ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {expandPassives && (
            <div className="p-4 sm:p-5 pt-0 border-t border-stone-800/60 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {stats.passives.map((passive, i) => (
                  <div
                    key={i}
                    className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3.5 hover:border-sky-500/30 transition"
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
      )}
    </div>
  );
};
