import React, { createContext, useContext, useEffect, useReducer, useMemo, useRef } from 'react';
import type { WolfData, CalculatedWolfStats, SavingThrowPips } from '../types/wolf';
import type { AppState } from '../store/wolfStore';
import {
  getInitialState,
  saveStateToStorage,
  wolfReducer,
  BROADCAST_CHANNEL_NAME,
} from '../store/wolfStore';
import { calculateWolfStats, getSkillCost, isNodeAvailable } from '../engine/rulesEngine';
import { SKILL_NODE_MAP } from '../engine/skillTreeData';

export type UserRole = 'dm' | 'player';

interface WolfContextType {
  state: AppState;
  activeWolf: WolfData;
  activeStats: CalculatedWolfStats;
  role: UserRole;
  setRole: (role: UserRole) => void;
  setActiveWolfId: (id: string) => void;
  addWolf: (name: string, avatarUrl?: string) => void;
  updateProfile: (name: string, avatarUrl: string) => void;
  unlockSkill: (nodeId: string) => boolean;
  feedFood: (stat: keyof SavingThrowPips) => void;
  grantPoints: (delta: number) => void;
  addFood: (delta: number) => void;
  respec: () => void;
  acknowledgeRulesUpdate: () => void;
}

const WolfContext = createContext<WolfContextType | null>(null);

function detectRoleFromUrl(): UserRole {
  if (typeof window === 'undefined') return 'player';
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.toLowerCase();
  if (params.get('role') === 'dm' || path.includes('/dm')) {
    return 'dm';
  }
  return 'player';
}

function detectActiveWolfFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('wolf') || params.get('lobo');
}

export const WolfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wolfReducer, undefined, getInitialState);
  const [role, setRoleState] = React.useState<UserRole>(detectRoleFromUrl);

  const tabId = useRef(Math.random().toString(36).substring(2)).current;
  const isRemoteSyncRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize broadcast channel and storage listeners once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        // Discard own messages or empty data
        if (!event.data || event.data.senderId === tabId) return;

        if (event.data.type === 'SYNC_STATE' && event.data.state) {
          isRemoteSyncRef.current = true;
          dispatch({ type: 'SYNC_STATE', state: event.data.state });
        }
      };
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'wolf_tracker_state_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.wolves) {
            isRemoteSyncRef.current = true;
            dispatch({ type: 'SYNC_STATE', state: parsed });
          }
        } catch (err) {
          console.warn('Storage sync parse error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [tabId]);

  // Persist locally and broadcast ONLY local updates (breaking echo loops)
  useEffect(() => {
    saveStateToStorage(state);

    if (isRemoteSyncRef.current) {
      // This state was received from another tab; do not echo it back!
      isRemoteSyncRef.current = false;
      return;
    }

    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: 'SYNC_STATE',
          state,
          senderId: tabId,
        });
      } catch (err) {
        console.warn('Broadcast send error:', err);
      }
    }
  }, [state, tabId]);

  // Sync wolf ID from URL if provided
  useEffect(() => {
    const urlWolfId = detectActiveWolfFromUrl();
    if (urlWolfId && state.wolves[urlWolfId] && state.activeWolfId !== urlWolfId) {
      dispatch({ type: 'SET_ACTIVE_WOLF', wolfId: urlWolfId });
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newRole === 'dm') {
        url.searchParams.set('role', 'dm');
      } else {
        url.searchParams.delete('role');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const activeWolf = useMemo(() => {
    return state.wolves[state.activeWolfId] || Object.values(state.wolves)[0];
  }, [state.wolves, state.activeWolfId]);

  const activeStats = useMemo(() => {
    return calculateWolfStats(activeWolf);
  }, [activeWolf]);

  const value: WolfContextType = {
    state,
    activeWolf,
    activeStats,
    role,
    setRole,
    setActiveWolfId: (wolfId: string) => dispatch({ type: 'SET_ACTIVE_WOLF', wolfId }),
    addWolf: (name: string, avatarUrl?: string) => dispatch({ type: 'ADD_WOLF', name, avatarUrl }),
    updateProfile: (name: string, avatarUrl: string) =>
      dispatch({ type: 'UPDATE_PROFILE', wolfId: activeWolf.id, name, avatarUrl }),
    unlockSkill: (nodeId: string): boolean => {
      const currentWolf = state.wolves[state.activeWolfId];
      if (!currentWolf) return false;
      const stats = calculateWolfStats(currentWolf);
      if (stats.availablePoints <= 0) return false;
      const node = SKILL_NODE_MAP.get(nodeId);
      if (!node || stats.availablePoints < getSkillCost(node) || !isNodeAvailable(currentWolf, node)) return false;

      dispatch({ type: 'UNLOCK_SKILL', wolfId: currentWolf.id, nodeId });
      return true;
    },
    feedFood: (stat: keyof SavingThrowPips) =>
      dispatch({ type: 'FEED_FOOD', wolfId: activeWolf.id, stat }),
    grantPoints: (delta: number) =>
      dispatch({ type: 'GRANT_POINTS', wolfId: activeWolf.id, delta }),
    addFood: (delta: number) =>
      dispatch({ type: 'ADD_FOOD', wolfId: activeWolf.id, delta }),
    respec: () =>
      dispatch({ type: 'RESPEC', wolfId: activeWolf.id }),
    acknowledgeRulesUpdate: () =>
      dispatch({ type: 'ACKNOWLEDGE_RULES_UPDATE', wolfId: activeWolf.id }),
  };

  return <WolfContext.Provider value={value}>{children}</WolfContext.Provider>;
};

export function useWolf(): WolfContextType {
  const context = useContext(WolfContext);
  if (!context) {
    throw new Error('useWolf must be used within a WolfProvider');
  }
  return context;
}
