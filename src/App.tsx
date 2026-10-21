import React, { useState } from 'react';
import { WolfProvider, useWolf } from './context/WolfContext';
import { WolfSheet } from './components/WolfSheet';
import { ImmediateUpgrades } from './components/ImmediateUpgrades';
import { DMDashboard } from './components/DMDashboard';
import {
  PawPrint,
  Sparkles,
  ShieldCheck,
  Plus,
  Share2,
  Check,
} from 'lucide-react';

type Tab = 'sheet' | 'upgrades' | 'dm';

const AppContent: React.FC = () => {
  const { state, activeWolf, activeStats, role, setRole, setActiveWolfId, addWolf } = useWolf();
  const [activeTab, setActiveTab] = useState<Tab>('sheet');
  const [isCopied, setIsCopied] = useState(false);
  const [showAddWolfPrompt, setShowAddWolfPrompt] = useState(false);
  const [newWolfName, setNewWolfName] = useState('');

  const wolvesList = Object.values(state.wolves);

  const handleShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('wolf', activeWolf.id);
    if (role === 'dm') {
      url.searchParams.set('role', 'dm');
    } else {
      url.searchParams.delete('role');
    }
    navigator.clipboard.writeText(url.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCreateWolf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWolfName.trim()) return;
    addWolf(newWolfName.trim());
    setNewWolfName('');
    setShowAddWolfPrompt(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20">
              <PawPrint className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-black tracking-tight text-sm sm:text-base text-stone-100 block">
                Wolf Companion
              </span>
              <span className="text-[10px] text-amber-400 font-medium block -mt-1">
                D&D 5e Evolution Tracker
              </span>
            </div>
          </div>

          {/* Wolf Selector & Actions */}
          <div className="flex items-center gap-2">
            {/* Multiple Wolves Selector */}
            <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-1 text-xs">
              <select
                value={activeWolf.id}
                onChange={(e) => setActiveWolfId(e.target.value)}
                className="bg-transparent text-stone-200 text-xs font-semibold px-2 py-1 outline-none cursor-pointer"
              >
                {wolvesList.map((w) => (
                  <option key={w.id} value={w.id} className="bg-stone-900 text-stone-200">
                    {w.name} (Nv. {w.unlockedNodeIds.length})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddWolfPrompt(true)}
                className="p-1 text-stone-400 hover:text-amber-400 hover:bg-stone-800/80 rounded-lg transition"
                title="Añadir otro lobo a la partida"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Share / Copy link button */}
            <button
              type="button"
              onClick={handleShareLink}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 border border-stone-700/60 text-xs font-medium transition cursor-pointer"
              title="Copiar enlace directo de este lobo"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </>
              )}
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  role === 'player'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Jugador
              </button>
              <button
                type="button"
                onClick={() => setRole('dm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  role === 'dm'
                    ? 'bg-purple-600 text-stone-100 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>DM</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav className="bg-stone-900/60 border-b border-stone-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'sheet'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <PawPrint className="w-4 h-4" />
              <span>Lobo Actual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upgrades')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer relative ${
                activeTab === 'upgrades'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Mejoras Inmediatas</span>
              {activeStats.availablePoints > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-2.5 right-1" />
              )}
            </button>

            {role === 'dm' && (
              <button
                type="button"
                onClick={() => setActiveTab('dm')}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'dm'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-purple-400/70 hover:text-purple-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel DM</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === 'sheet' && (
          <WolfSheet onGoToUpgrades={() => setActiveTab('upgrades')} />
        )}

        {activeTab === 'upgrades' && (
          <ImmediateUpgrades />
        )}

        {activeTab === 'dm' && (
          <DMDashboard />
        )}
      </main>

      {/* Modal to add another wolf */}
      {showAddWolfPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h4 className="text-base font-bold text-stone-100 mb-2">
              Añadir un Nuevo Lobo
            </h4>
            <p className="text-xs text-stone-400 mb-4">
              Crea otro compañero animal para la partida (ej. para otro jugador).
            </p>
            <form onSubmit={handleCreateWolf}>
              <input
                type="text"
                autoFocus
                placeholder="Nombre del nuevo lobo..."
                value={newWolfName}
                onChange={(e) => setNewWolfName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-stone-100 mb-4 focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWolfPrompt(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition"
                >
                  Crear Lobo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-600">
        <p>Wolf Companion D&D Evolution Tracker • Compatible con Cloudflare Pages & Vercel</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <WolfProvider>
      <AppContent />
    </WolfProvider>
  );
}
