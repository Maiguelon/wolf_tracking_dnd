import React, { useState } from 'react';
import { useWolf } from '../context/WolfContext';
import { StatsGrid } from './StatsGrid';
import { SavingThrowDisplay } from './SavingThrowDisplay';
import { CommandsList } from './CommandsList';
import { AvatarPickerModal } from './AvatarPickerModal';
import { Sparkles, Edit3, ShieldAlert, Award } from 'lucide-react';

interface Props {
  onGoToUpgrades?: () => void;
}

export const WolfSheet: React.FC<Props> = ({ onGoToUpgrades }) => {
  const { activeWolf, activeStats, role, updateProfile, feedFood } = useWolf();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Wolf Profile & Level Header */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          {/* Avatar with edit overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-stone-950">
              <img
                src={activeWolf.avatarUrl}
                alt={activeWolf.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/wolf_gray.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="absolute -bottom-2 -right-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 p-1.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              title="Cambiar avatar o nombre"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Name & Level Progress */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
                    {activeWolf.name}
                  </h1>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-stone-500 hover:text-stone-300 transition"
                    title="Editar nombre"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Compañero Bestia • Sintonizado • 1 semana downtime + 100 po = 1 punto
                </p>
              </div>

              {/* Available Points Badge */}
              {activeStats.availablePoints > 0 ? (
                <button
                  type="button"
                  onClick={onGoToUpgrades}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>+{activeStats.availablePoints} Punto(s) para gastar</span>
                </button>
              ) : (
                <div className="text-xs text-stone-500 px-3 py-1.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
                  {role === 'dm' ? 'Puntos al día' : 'Puntos asignados'}
                </div>
              )}
            </div>

            {/* Level Checkboxes (Matching the 20 boxes on the physical sheet) */}
            <div className="mt-4 pt-4 border-t border-stone-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Nivel del Lobo: <strong className="text-stone-100">{activeStats.level} / 20</strong>
                </span>
                <span className="text-stone-500 text-[11px]">
                  {activeStats.spentPoints} gastados • {activeWolf.totalSkillPoints} totales
                </span>
              </div>

              {/* 20 Checkbox grid */}
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {[...Array(20)].map((_, i) => {
                  const isUnlocked = i < activeStats.spentPoints;
                  const isAvailableToSpend = i < activeWolf.totalSkillPoints;

                  return (
                    <div
                      key={i}
                      className={`h-4 sm:h-5 rounded-md border flex items-center justify-center text-[10px] font-bold transition-all ${
                        isUnlocked
                          ? 'bg-amber-500 border-amber-400 text-stone-950 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : isAvailableToSpend
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 animate-pulse'
                          : 'bg-stone-950/70 border-stone-800 text-stone-600'
                      }`}
                      title={`Punto ${i + 1}: ${
                        isUnlocked
                          ? 'Mejora aprendida'
                          : isAvailableToSpend
                          ? 'Punto disponible para gastar'
                          : 'Bloqueado (requiere nivel otorgado por DM)'
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Vitals (AC, HP, Speed, Bite) */}
      <StatsGrid stats={activeStats} />

      {/* Saving Throws with 5 food pips */}
      <SavingThrowDisplay
        savingThrows={activeStats.savingThrows}
        pips={activeWolf.savingThrowPips}
        specialFoodCount={activeWolf.specialFoodCount}
        onFeed={(stat) => feedFood(stat)}
        canFeed={true}
      />

      {/* Unlocked Commands, Passives and Spells */}
      <CommandsList stats={activeStats} />

      {/* Quick notice of how to level up from the sheet */}
      <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-4 text-xs text-stone-400 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-300">
            Reglas de la Hoja de Compañero:
          </p>
          <p>
            • <strong>Movimiento:</strong> El lobo se desplaza hasta su velocidad en tu turno sin gastar tu acción.
          </p>
          <p>
            • <strong>Acciones del Lobo:</strong> Debes usar tu Acción Adicional para ordenarle una acción (solo puede ejecutar las que haya aprendido en el árbol).
          </p>
          <p>
            • <strong>Bonificadores:</strong> No son acumulativos (siempre se aplica el valor más alto alcanzado en la rama).
          </p>
        </div>
      </div>

      {/* Avatar & Name Edit Modal */}
      <AvatarPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentAvatar={activeWolf.avatarUrl}
        currentName={activeWolf.name}
        onSave={(newName, newAvatar) => updateProfile(newName, newAvatar)}
      />
    </div>
  );
};
