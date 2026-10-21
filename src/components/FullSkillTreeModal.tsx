import React, { useState } from 'react';
import { useWolf } from '../context/WolfContext';
import { SKILL_TREE_NODES, SKILL_NODE_MAP, BRANCH_METADATA } from '../engine/skillTreeData';
import { getSkillCost, isNodeAvailable } from '../engine/rulesEngine';
import type { SkillBranchId, SkillNode } from '../types/wolf';
import {
  X,
  Check,
  Lock,
  Sparkles,
  Crown,
  Swords,
  Wind,
  Compass,
  HeartHandshake,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLearnNode?: (node: SkillNode) => void;
}

const BRANCHES: SkillBranchId[] = ['combat', 'mobility', 'tracking', 'emotional'];

export const FullSkillTreeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLearnNode,
}) => {
  const { activeWolf, activeStats } = useWolf();
  const [selectedBranch, setSelectedBranch] = useState<SkillBranchId>('combat');
  const [activeNodeDetail, setActiveNodeDetail] = useState<SkillNode | null>(null);

  if (!isOpen) return null;

  const unlockedSet = new Set(activeWolf.unlockedNodeIds);
  const branchMeta = BRANCH_METADATA[selectedBranch];
  const branchNodes = SKILL_TREE_NODES.filter((n) => n.branch === selectedBranch);

  const regularNodes = branchNodes.filter((n) => !n.isApex);
  const apexNodes = branchNodes.filter((n) => n.isApex);

  const getBranchIcon = (b: SkillBranchId) => {
    switch (b) {
      case 'combat':
        return <Swords className="w-4 h-4" />;
      case 'mobility':
        return <Wind className="w-4 h-4" />;
      case 'tracking':
        return <Compass className="w-4 h-4" />;
      case 'emotional':
        return <HeartHandshake className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100">
                Árbol Completo de Habilidades
              </h3>
              <p className="text-xs text-stone-400">
                Planifica las ramas futuras de {activeWolf.name} ({activeStats.availablePoints} puntos disponibles)
              </p>
            </div>
          </div>

          <button
            aria-label="Cerrar árbol de habilidades"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch Selector & Legend */}
        <div className="p-3 sm:p-4 border-b border-stone-800 bg-stone-900/90 flex flex-wrap items-center justify-between gap-3">
          {/* Branch tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {BRANCHES.map((b) => {
              const meta = BRANCH_METADATA[b];
              const isSelected = selectedBranch === b;
              const pointsInBranch = activeStats.branchPoints[b];

              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBranch(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {getBranchIcon(b)}
                  <span>{meta.nameEs}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-stone-950 text-amber-300'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {pointsInBranch}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Aprendida
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-700" /> Bloqueada
            </span>
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" /> Apex (10 pts en rama · coste 2)
            </span>
          </div>
        </div>

        {/* Tree Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Branch summary box */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-200">
                Rama: {branchMeta.nameEs}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {branchMeta.descriptionEs}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-400 block font-mono">
                {activeStats.branchPoints[selectedBranch]} / 10 puntos
              </span>
              <span className="text-[10px] text-stone-500 block">
                {activeStats.branchPoints[selectedBranch] >= 10
                  ? '¡Apex Desbloqueado!'
                  : `Faltan ${10 - activeStats.branchPoints[selectedBranch]} para Apex`}
              </span>
            </div>
          </div>

          {/* Standard Nodes Grid */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Habilidades de la Rama
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regularNodes.map((node) => {
                const isUnlocked = unlockedSet.has(node.id);
                const isAvailable = isNodeAvailable(activeWolf, node);
                const canLearn = isAvailable && activeStats.availablePoints >= getSkillCost(node);

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNodeDetail(node)}
                    className={`border rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer relative ${
                      isUnlocked
                        ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400 shadow-sm'
                        : isAvailable
                        ? 'bg-amber-950/20 border-amber-400/60 hover:border-amber-300 ring-1 ring-amber-400/20'
                        : 'bg-stone-950/40 border-stone-800/80 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] text-stone-500 font-mono truncate">
                          {node.name}
                        </span>
                        {isUnlocked ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : isAvailable ? (
                          <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 animate-pulse">
                            <Sparkles className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center shrink-0">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <h6 className="text-sm font-bold text-stone-100 mb-1">
                        {node.nameEs}
                      </h6>
                      <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                        {node.descriptionEs}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">
                        {isUnlocked
                          ? '✅ Aprendida'
                          : isAvailable
                          ? canLearn ? '⚡ Disponible' : `Requiere ${getSkillCost(node)} ${getSkillCost(node) === 1 ? 'punto' : 'puntos'}`
                          : '🔒 Bloqueada'}
                      </span>

                      {canLearn && onLearnNode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLearnNode(node);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[10px] transition cursor-pointer"
                        >
                          Aprender
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Apex Skills Section */}
          <div className="pt-4 border-t border-stone-800">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Habilidades Apex (Requiere 10 Puntos en {branchMeta.nameEs})
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {apexNodes.map((node) => {
                const isUnlocked = unlockedSet.has(node.id);
                const isAvailable = isNodeAvailable(activeWolf, node);
                const canLearn = isAvailable && activeStats.availablePoints >= getSkillCost(node);

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNodeDetail(node)}
                    className={`border rounded-2xl p-4 flex flex-col justify-between transition cursor-pointer ${
                      isUnlocked
                        ? 'bg-amber-950/30 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : isAvailable
                        ? 'bg-amber-950/20 border-amber-500/60 hover:border-amber-400'
                        : 'bg-stone-950/40 border-stone-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          APEX · {getSkillCost(node)} puntos
                        </span>
                        {isUnlocked ? (
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <h6 className="text-sm font-bold text-amber-200 mb-1">
                        {node.nameEs}
                      </h6>
                      <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                        {node.descriptionEs}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 text-[10px]">
                        {isUnlocked
                          ? '✅ Desbloqueada'
                          : isAvailable
                          ? canLearn ? '⚡ Disponible' : `Requiere ${getSkillCost(node)} puntos`
                          : activeStats.branchPoints[node.branch] < (node.apexPointsRequired ?? 10)
                          ? 'Requiere 10 pts en la rama'
                          : `Requiere ${node.prerequisites.map(id => SKILL_NODE_MAP.get(id)?.nameEs ?? id).join(' y ')}`}
                      </span>

                      {canLearn && onLearnNode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLearnNode(node);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[10px] transition cursor-pointer"
                        >
                          Aprender
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Node Detail Drawer / Preview Modal if clicked */}
        {activeNodeDetail && (
          <div className="p-4 border-t border-stone-800 bg-stone-950/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-mono">
                  {activeNodeDetail.name}
                </span>
                <span className="text-xs font-bold text-stone-200">
                  {activeNodeDetail.nameEs}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {activeNodeDetail.descriptionEs}
              </p>
              <p className="text-xs text-stone-400">Coste: {getSkillCost(activeNodeDetail)} {getSkillCost(activeNodeDetail) === 1 ? 'punto' : 'puntos'}.</p>
              {activeNodeDetail.prerequisites.length > 0 && (
                <p className="text-xs text-stone-400">
                  Requiere: {activeNodeDetail.prerequisites.map(id => SKILL_NODE_MAP.get(id)?.nameEs ?? id).join(activeNodeDetail.requiresAnyPrereq ? ' o ' : ' y ')}.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setActiveNodeDetail(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-stone-400 hover:text-stone-200"
              >
                Cerrar
              </button>
              {isNodeAvailable(activeWolf, activeNodeDetail) &&
                activeStats.availablePoints >= getSkillCost(activeNodeDetail) &&
                !unlockedSet.has(activeNodeDetail.id) &&
                onLearnNode && (
                  <button
                    type="button"
                    onClick={() => {
                      onLearnNode(activeNodeDetail);
                      setActiveNodeDetail(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition"
                  >
                    Aprender Habilidad
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
