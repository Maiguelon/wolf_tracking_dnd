import React, { useState } from 'react';
import { useWolf } from '../context/WolfContext';
import { SavingThrowDisplay } from './SavingThrowDisplay';
import { SKILL_NODE_MAP, BRANCH_METADATA } from '../engine/skillTreeData';
import type { SavingThrowPips, SkillBranchId } from '../types/wolf';
import {
  ShieldCheck,
  Plus,
  Minus,
  Utensils,
  RotateCcw,
  Link,
  Check,
  Award,
  AlertTriangle,
  PawPrint,
  Layers,
} from 'lucide-react';

export const DMDashboard: React.FC = () => {
  const {
    state,
    activeWolf,
    activeStats,
    setActiveWolfId,
    grantPoints,
    addFood,
    feedFood,
    respec,
  } = useWolf();

  const [confirmRespec, setConfirmRespec] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'player' | 'dm' | null>(null);

  const wolves = Object.values(state.wolves);

  const handleCopyLink = (targetRole: 'player' | 'dm') => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('wolf', activeWolf.id);
    if (targetRole === 'dm') {
      url.searchParams.set('role', 'dm');
    } else {
      url.searchParams.delete('role');
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(targetRole);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleExecuteRespec = () => {
    respec();
    setConfirmRespec(false);
  };

  // Group unlocked skills by branch for inspection
  const unlockedByBranch: Record<SkillBranchId, string[]> = {
    combat: [],
    mobility: [],
    tracking: [],
    emotional: [],
  };

  for (const nodeId of activeWolf.unlockedNodeIds) {
    const node = SKILL_NODE_MAP.get(nodeId);
    if (node) {
      unlockedByBranch[node.branch].push(node.nameEs);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-stone-900/50 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-100 flex items-center gap-2">
                <span>Panel del Dungeon Master</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Control Total
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Otorga niveles, comida especial, enlaces de acceso y gestiona la redistribución de puntos.
              </p>
            </div>
          </div>

          {/* Quick Share Links */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyLink('player')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-stone-800 text-xs font-semibold transition cursor-pointer"
            >
              {copiedLink === 'player' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Jugador Copiado</span>
                </>
              ) : (
                <>
                  <Link className="w-3.5 h-3.5" />
                  <span>Link Jugador</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleCopyLink('dm')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 border border-purple-800/50 text-xs font-semibold transition cursor-pointer"
            >
              {copiedLink === 'dm' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link DM Copiado</span>
                </>
              ) : (
                <>
                  <Link className="w-3.5 h-3.5" />
                  <span>Link DM</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Wolf Selection Switcher */}
      {wolves.length > 1 && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-stone-300">
              Lobo Seleccionado:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {wolves.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setActiveWolfId(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  w.id === activeWolf.id
                    ? 'bg-purple-600 text-stone-100 shadow-md'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <span>{w.name}</span>
                <span className="text-[10px] opacity-75">
                  Nv. {w.unlockedNodeIds.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary DM Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Level Up & Points Manager */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                Subida de Nivel / Puntos
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
              1 sem. downtime + 100 po
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Otorga puntos cuando el personaje entrene con su lobo. El jugador verá los nuevos puntos disponibles de inmediato en su pantalla.
          </p>

          {/* Stats indicator */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-stone-950 border border-stone-800/80 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Puntos Totales
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {activeWolf.totalSkillPoints}
              </span>
            </div>

            <div className="bg-stone-950 border border-stone-800/80 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Gastados (Nivel)
              </span>
              <span className="text-xl font-black text-stone-200 font-mono">
                {activeStats.spentPoints}
              </span>
            </div>

            <div className="bg-stone-950 border border-stone-800/80 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Por Gastar
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {activeStats.availablePoints}
              </span>
            </div>
          </div>

          {/* Point Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => grantPoints(1)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Punto de Habilidad</span>
            </button>

            <button
              type="button"
              onClick={() => grantPoints(5)}
              className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
              title="Añadir 5 puntos (ej. salto de nivel grande)"
            >
              +5
            </button>

            <button
              type="button"
              disabled={activeStats.availablePoints <= 0}
              onClick={() => grantPoints(-1)}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                activeStats.availablePoints > 0
                  ? 'bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 cursor-pointer active:scale-95'
                  : 'bg-stone-950 text-stone-600 border border-stone-850 cursor-not-allowed opacity-50'
              }`}
              title="Restar 1 punto no gastado"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-1</span>
            </button>
          </div>
        </div>

        {/* Special Food Manager */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                Comida Especial
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              {activeWolf.specialFoodCount} raciones en inventario
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Las comidas especiales aumentan permanentemente las tiradas de salvación del lobo (+1 por ración, hasta 5 en cada atributo).
          </p>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => addFood(1)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Comida Especial</span>
            </button>

            <button
              type="button"
              onClick={() => addFood(5)}
              className="py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 font-bold text-xs active:scale-95 transition cursor-pointer"
            >
              +5
            </button>

            <button
              type="button"
              disabled={activeWolf.specialFoodCount <= 0}
              onClick={() => addFood(-1)}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                activeWolf.specialFoodCount > 0
                  ? 'bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 cursor-pointer active:scale-95'
                  : 'bg-stone-950 text-stone-600 border border-stone-850 cursor-not-allowed opacity-50'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-1</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] text-stone-500">
            * También puedes alimentar directamente al lobo en las casillas de abajo.
          </div>
        </div>
      </div>

      {/* Saving Throw Feeding Grid for DM */}
      <SavingThrowDisplay
        savingThrows={activeStats.savingThrows}
        pips={activeWolf.savingThrowPips}
        specialFoodCount={activeWolf.specialFoodCount}
        onFeed={(stat: keyof SavingThrowPips) => feedFood(stat)}
        canFeed={true}
      />

      {/* Real-Time Inspection of Player's Chosen Skills */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
              Habilidades Aprendidas por {activeWolf.name}
            </h3>
          </div>
          <span className="text-xs text-stone-400">
            {activeStats.spentPoints} habilidades activas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['combat', 'mobility', 'tracking', 'emotional'] as SkillBranchId[]).map((b) => {
            const meta = BRANCH_METADATA[b];
            const skills = unlockedByBranch[b];

            return (
              <div
                key={b}
                className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className={`text-xs font-bold ${meta.color}`}>
                    {meta.nameEs}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded">
                    {skills.length}
                  </span>
                </div>

                {skills.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    {skills.map((name, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-stone-600 italic py-1">
                    Sin habilidades en esta rama.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Respec / Reset Section (DM ONLY) */}
      <div className="bg-stone-900/90 border border-red-900/40 rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Zona de Reasignación de Puntos (Respec)</span>
          </div>
          <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
            Si el jugador se equivocó o quiere cambiar su build, el DM puede reiniciar las habilidades aprendidas.
            <strong> Los {activeWolf.totalSkillPoints} puntos totales se conservarán íntegros</strong> en la reserva para que el jugador los vuelva a gastar.
          </p>
        </div>

        <div>
          {confirmRespec ? (
            <div className="flex items-center gap-2 animate-fadeIn">
              <button
                type="button"
                onClick={() => setConfirmRespec(false)}
                className="px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 bg-stone-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteRespec}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-stone-100 shadow-lg shadow-red-600/30 active:scale-95 transition cursor-pointer"
              >
                Confirmar Respec
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRespec(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/50 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Habilidades del Lobo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
