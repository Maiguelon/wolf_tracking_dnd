import React, { useState } from 'react';
import { useWolf } from '../context/WolfContext';
import { StatsGrid } from './StatsGrid';
import { SavingThrowDisplay } from './SavingThrowDisplay';
import { CommandsList } from './CommandsList';
import { AvatarPickerModal } from './AvatarPickerModal';
import { Sparkles, Edit3 } from 'lucide-react';

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
                  (e.target as HTMLImageElement).src = '/avatars/wolf_gray.png';
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

          {/* Name & Level Badge */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
                    {activeWolf.name}
                  </h1>
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono shadow-sm">
                    Nv. {activeStats.level}
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-stone-500 hover:text-stone-300 transition p-1"
                    title="Editar nombre o avatar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Compañero Bestia • Sintonizado • {activeStats.spentPoints} mejoras aprendidas • {activeWolf.totalSkillPoints} puntos totales
                </p>
              </div>

              {/* Available Points Badge */}
              {activeStats.availablePoints > 0 ? (
                <button
                  type="button"
                  onClick={onGoToUpgrades}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse hover:bg-emerald-500/30 transition cursor-pointer self-center sm:self-auto shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>+{activeStats.availablePoints} Punto(s) para gastar</span>
                </button>
              ) : (
                <div className="text-xs text-stone-500 px-3 py-1.5 rounded-xl bg-stone-950/60 border border-stone-800/80 self-center sm:self-auto">
                  {role === 'dm' ? 'Puntos al día' : 'Puntos asignados'}
                </div>
              )}
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
