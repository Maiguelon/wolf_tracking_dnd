import type { WolfData, SavingThrowPips } from '../types/wolf';
import {
  createInitialWolf,
  unlockNode,
  feedSpecialFood,
  respecWolf,
} from '../engine/rulesEngine';

export interface AppState {
  wolves: Record<string, WolfData>;
  activeWolfId: string;
}

const STORAGE_KEY = 'wolf_tracker_state_v1';
const BROADCAST_CHANNEL_NAME = 'wolf_tracker_channel';

export function getInitialState(): AppState {
  const defaultWolf = createInitialWolf('lobo-1', 'Colmillo Gris');
  
  if (typeof window === 'undefined') {
    return {
      wolves: { [defaultWolf.id]: defaultWolf },
      activeWolfId: defaultWolf.id,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.wolves && parsed.activeWolfId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al cargar estado de localStorage:', e);
  }

  return {
    wolves: { [defaultWolf.id]: defaultWolf },
    activeWolfId: defaultWolf.id,
  };
}

export function saveStateToStorage(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error al guardar estado:', e);
  }
}

export type WolfAction =
  | { type: 'SET_ACTIVE_WOLF'; wolfId: string }
  | { type: 'ADD_WOLF'; name: string; avatarUrl?: string }
  | { type: 'UPDATE_PROFILE'; wolfId: string; name: string; avatarUrl: string }
  | { type: 'UNLOCK_SKILL'; wolfId: string; nodeId: string }
  | { type: 'FEED_FOOD'; wolfId: string; stat: keyof SavingThrowPips }
  | { type: 'GRANT_POINTS'; wolfId: string; delta: number }
  | { type: 'ADD_FOOD'; wolfId: string; delta: number }
  | { type: 'RESPEC'; wolfId: string }
  | { type: 'SYNC_STATE'; state: AppState };

export function wolfReducer(state: AppState, action: WolfAction): AppState {
  switch (action.type) {
    case 'SYNC_STATE':
      return action.state;

    case 'SET_ACTIVE_WOLF': {
      if (!state.wolves[action.wolfId]) return state;
      return {
        ...state,
        activeWolfId: action.wolfId,
      };
    }

    case 'ADD_WOLF': {
      const id = `lobo-${Date.now().toString().slice(-4)}`;
      const newWolf: WolfData = {
        ...createInitialWolf(id, action.name.trim() || 'Nuevo Lobo'),
        avatarUrl: action.avatarUrl || '/avatars/wolf-gray.webp',
      };
      return {
        ...state,
        wolves: {
          ...state.wolves,
          [id]: newWolf,
        },
        activeWolfId: id,
      };
    }

    case 'UPDATE_PROFILE': {
      const wolf = state.wolves[action.wolfId];
      if (!wolf) return state;
      return {
        ...state,
        wolves: {
          ...state.wolves,
          [action.wolfId]: {
            ...wolf,
            name: action.name.trim() || wolf.name,
            avatarUrl: action.avatarUrl || wolf.avatarUrl,
            updatedAt: Date.now(),
          },
        },
      };
    }

    case 'UNLOCK_SKILL': {
      const wolf = state.wolves[action.wolfId];
      if (!wolf) return state;
      try {
        const updated = unlockNode(wolf, action.nodeId);
        return {
          ...state,
          wolves: {
            ...state.wolves,
            [action.wolfId]: updated,
          },
        };
      } catch (err) {
        console.warn('No se pudo desbloquear habilidad:', err);
        return state;
      }
    }

    case 'FEED_FOOD': {
      const wolf = state.wolves[action.wolfId];
      if (!wolf) return state;
      try {
        const updated = feedSpecialFood(wolf, action.stat);
        return {
          ...state,
          wolves: {
            ...state.wolves,
            [action.wolfId]: updated,
          },
        };
      } catch (err) {
        console.warn('No se pudo alimentar al lobo:', err);
        return state;
      }
    }

    case 'GRANT_POINTS': {
      const wolf = state.wolves[action.wolfId];
      if (!wolf) return state;
      const newTotal = Math.max(wolf.unlockedNodeIds.length, wolf.totalSkillPoints + action.delta);
      return {
        ...state,
        wolves: {
          ...state.wolves,
          [action.wolfId]: {
            ...wolf,
            totalSkillPoints: newTotal,
            updatedAt: Date.now(),
          },
        },
      };
    }

    case 'ADD_FOOD': {
      const wolf = state.wolves[action.wolfId];
      if (!wolf) return state;
      const newFood = Math.max(0, wolf.specialFoodCount + action.delta);
      return {
        ...state,
        wolves: {
          ...state.wolves,
          [action.wolfId]: {
            ...wolf,
            specialFoodCount: newFood,
            updatedAt: Date.now(),
          },
        },
      };
    }

    case 'RESPEC': {
      const wolf = state.wolves[action.wolfId];
      if (!wolf) return state;
      const updated = respecWolf(wolf);
      return {
        ...state,
        wolves: {
          ...state.wolves,
          [action.wolfId]: updated,
        },
      };
    }

    default:
      return state;
  }
}

export { BROADCAST_CHANNEL_NAME, STORAGE_KEY };
