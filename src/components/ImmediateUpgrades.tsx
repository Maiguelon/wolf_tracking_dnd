import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useWolf } from '../context/WolfContext';
import { getAvailableUpgrades } from '../engine/rulesEngine';
import { BRANCH_METADATA } from '../engine/skillTreeData';
import type { SkillBranchId, SkillNode } from '../types/wolf';
import {
  Swords,
  Wind,
  Compass,
  HeartHandshake,
  Sparkles,
  Network,
  ChevronLeft,
  ChevronRight,
  Lock,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { FullSkillTreeModal } from './FullSkillTreeModal';

const BRANCH_ORDER: SkillBranchId[] = ['combat', 'mobility', 'tracking', 'emotional'];

export const ImmediateUpgrades: React.FC = () => {
  const { activeWolf, activeStats, unlockSkill } = useWolf();
  const [selectedBranch, setSelectedBranch] = useState<SkillBranchId>('combat');
  const [showFullTreeModal, setShowFullTreeModal] = useState(false);
  const [unlockingNodeId, setUnlockingNodeId] = useState<string | null>(null);

  const availableMap = getAvailableUpgrades(activeWolf);
  const currentBranchNodes = availableMap[selectedBranch];
  const currentBranchMeta = BRANCH_METADATA[selectedBranch];

  const branchIndex = BRANCH_ORDER.indexOf(selectedBranch);

  const handlePrevBranch = () => {
    const prevIndex = (branchIndex - 1 + BRANCH_ORDER.length) % BRANCH_ORDER.length;
    setSelectedBranch(BRANCH_ORDER[prevIndex]);
  };

  const handleNextBranch = () => {
    const nextIndex = (branchIndex + 1) % BRANCH_ORDER.length;
    setSelectedBranch(BRANCH_ORDER[nextIndex]);
  };

  const handleLearn = (node: SkillNode) => {
    if (activeStats.availablePoints <= 0) return;
    setUnlockingNodeId(node.id);

    try {
      unlockSkill(node.id);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#38bdf8'],
      });
    } finally {
      setTimeout(() => setUnlockingNodeId(null), 300);
    }
  };

  const getBranchIcon = (branch: SkillBranchId) => {
    switch (branch) {
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
    <div className="space-y-6">
      {/* Top Banner: Points Available + Full Tree Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
              activeStats.availablePoints > 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : 'bg-stone-950 text-stone-500 border border-stone-800'
            }`}
          >
            {activeStats.availablePoints}
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-1.5">
              <span>Puntos de Habilidad Disponibles</span>
              {activeStats.availablePoints > 0 && (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
            </h2>
            <p className="text-xs text-stone-400">
              {activeStats.availablePoints > 0
                ? 'Elige una de las mejoras inmediatas a continuación para aprenderla.'
                : 'Pide al DM que aumente tus puntos cuando entrenes en downtime (100 po + 1 semana).'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFullTreeModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 border border-stone-700/80 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Network className="w-4 h-4 text-amber-400" />
          <span>Ver Árbol Completo</span>
        </button>
      </div>

      {/* Branch Selector Tabs with Swipe indicator */}
      <div className="relative">
        <div className="flex items-center justify-between gap-1 sm:gap-2 bg-stone-900/80 border border-stone-800 p-1.5 rounded-2xl overflow-x-auto">
          {BRANCH_ORDER.map((branchId) => {
            const meta = BRANCH_METADATA[branchId];
            const isSelected = selectedBranch === branchId;
            const count = availableMap[branchId].length;
            const branchPoints = activeStats.branchPoints[branchId];

            return (
              <button
                key={branchId}
                type="button"
                onClick={() => setSelectedBranch(branchId)}
                className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-stone-800 text-stone-100 shadow-md border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-950/40'
                }`}
              >
                <span className={meta.color}>{getBranchIcon(branchId)}</span>
                <span className="truncate">{meta.nameEs}</span>

                {/* Badge of branch points spent */}
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-950 text-stone-400 font-mono border border-stone-800">
                  {branchPoints}
                </span>

                {/* Notification dot if upgrades available in this branch */}
                {count > 0 && activeStats.availablePoints > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Swipe / Arrow controls */}
        <div className="flex items-center justify-between px-1 mt-2 text-xs text-stone-500">
          <button
            onClick={handlePrevBranch}
            className="flex items-center gap-1 hover:text-stone-300 transition py-1"
          >
            <ChevronLeft className="w-4 h-4" /> Rama anterior
          </button>
          <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
            Desliza o cambia entre ramas
          </span>
          <button
            onClick={handleNextBranch}
            className="flex items-center gap-1 hover:text-stone-300 transition py-1"
          >
            Siguiente rama <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards of Immediate Upgrades with Framer Motion Swipe Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBranch}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Branch Header Description */}
          <div className="border border-stone-800/80 bg-stone-900/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={currentBranchMeta.color}>
                  {getBranchIcon(selectedBranch)}
                </span>
                <h3 className="text-sm font-bold text-stone-200">
                  Rama de {currentBranchMeta.nameEs}
                </h3>
                <span className="text-[11px] text-stone-500">
                  ({activeStats.branchPoints[selectedBranch]} puntos invertidos
                  {activeStats.branchPoints[selectedBranch] >= 10
                    ? ' • ¡Apex Desbloqueable!'
                    : ` • ${10 - activeStats.branchPoints[selectedBranch]} para Apex`})
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {currentBranchMeta.descriptionEs}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className="text-xs font-bold text-stone-300 block">
                {currentBranchNodes.length}
              </span>
              <span className="text-[10px] text-stone-500 block">
                disponibles ahora
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          {currentBranchNodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentBranchNodes.map((node) => {
                const canAfford = activeStats.availablePoints > 0;
                const isApex = node.isApex;

                return (
                  <div
                    key={node.id}
                    className={`bg-stone-900/90 border rounded-2xl p-5 flex flex-col justify-between shadow-lg transition duration-200 relative overflow-hidden group ${
                      isApex
                        ? 'border-amber-500/50 hover:border-amber-400 bg-gradient-to-br from-amber-950/30 to-stone-900/90'
                        : 'border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs text-stone-500 font-mono italic">
                          {node.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isApex && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Habilidad Apex
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800">
                            {node.actionType === 'bonus_action'
                              ? 'Acción Adicional'
                              : node.actionType === 'daily'
                              ? '1/día'
                              : node.actionType === 'weekly'
                              ? '1/semana'
                              : node.category === 'stat_boost'
                              ? 'Mejora Estadística'
                              : 'Rasgo Pasivo'}
                          </span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h4 className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition">
                        {node.nameEs}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                        {node.descriptionEs}
                      </p>

                      {/* Stat change preview if modifiers exist */}
                      {node.modifiers && (
                        <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-wrap gap-2 text-xs">
                          {node.modifiers.ac && (
                            <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                              <Shield className="w-3.5 h-3.5" />
                              CA sube a <strong>{node.modifiers.ac}</strong>
                            </span>
                          )}
                          {node.modifiers.hp && (
                            <span className="inline-flex items-center gap-1 text-red-300 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/40">
                              PG máximos: <strong>{node.modifiers.hp}</strong>
                            </span>
                          )}
                          {node.modifiers.speed && (
                            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                              Velocidad: <strong>{node.modifiers.speed} pies</strong>
                            </span>
                          )}
                          {node.modifiers.jump && (
                            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                              Salto: <strong>{node.modifiers.jump} pies</strong>
                            </span>
                          )}
                          {node.modifiers.biteDamage && (
                            <span className="inline-flex items-center gap-1 text-orange-300 bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-800/40">
                              <Zap className="w-3.5 h-3.5" />
                              Mordisco: <strong>+{node.modifiers.biteDamage}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-stone-500">
                        Coste: <strong className="text-stone-300">1 Punto</strong>
                      </div>

                      <button
                        type="button"
                        disabled={!canAfford || unlockingNodeId === node.id}
                        onClick={() => handleLearn(node)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md ${
                          canAfford
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-500/20'
                            : 'bg-stone-800 text-stone-500 border border-stone-700/50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Aprender Habilidad</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Requiere Punto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-300">
                No hay más mejoras inmediatas en esta rama por ahora
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ya has completado todas las opciones disponibles en este nivel o necesitas desbloquear un prerrequisito en otra rama.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Full Tree Modal */}
      <FullSkillTreeModal
        isOpen={showFullTreeModal}
        onClose={() => setShowFullTreeModal(false)}
        onLearnNode={handleLearn}
      />
    </div>
  );
};
