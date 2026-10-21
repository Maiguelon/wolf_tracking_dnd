import { describe, it, expect } from 'vitest';
import { wolfReducer } from './wolfStore';
import type { AppState } from './wolfStore';
import { createInitialWolf } from '../engine/rulesEngine';

describe('Wolf Store Reducer', () => {
  const initialWolf = createInitialWolf('lobo-1', 'Colmillo');
  const baseState: AppState = {
    wolves: { [initialWolf.id]: initialWolf },
    activeWolfId: initialWolf.id,
  };

  it('handles GRANT_POINTS correctly without dropping below spent points', () => {
    // Add 2 points
    let state = wolfReducer(baseState, {
      type: 'GRANT_POINTS',
      wolfId: 'lobo-1',
      delta: 2,
    });
    expect(state.wolves['lobo-1'].totalSkillPoints).toBe(2);

    // Try subtracting 5 points (should not drop below 0 spent)
    state = wolfReducer(state, {
      type: 'GRANT_POINTS',
      wolfId: 'lobo-1',
      delta: -10,
    });
    expect(state.wolves['lobo-1'].totalSkillPoints).toBe(0);
  });

  it('handles ADD_WOLF and SET_ACTIVE_WOLF', () => {
    const state = wolfReducer(baseState, {
      type: 'ADD_WOLF',
      name: 'Lobo Blanco',
    });

    const wolfIds = Object.keys(state.wolves);
    expect(wolfIds.length).toBe(2);
    expect(state.activeWolfId).not.toBe('lobo-1');

    const newWolf = state.wolves[state.activeWolfId];
    expect(newWolf.name).toBe('Lobo Blanco');

    // Switch back to wolf-1
    const switchedState = wolfReducer(state, {
      type: 'SET_ACTIVE_WOLF',
      wolfId: 'lobo-1',
    });
    expect(switchedState.activeWolfId).toBe('lobo-1');
  });

  it('handles UPDATE_PROFILE', () => {
    const state = wolfReducer(baseState, {
      type: 'UPDATE_PROFILE',
      wolfId: 'lobo-1',
      name: 'Fantasma del Bosque',
      avatarUrl: '/avatars/wolf-white.webp',
    });

    expect(state.wolves['lobo-1'].name).toBe('Fantasma del Bosque');
    expect(state.wolves['lobo-1'].avatarUrl).toBe('/avatars/wolf-white.webp');
  });

  it('handles UNLOCK_SKILL and RESPEC', () => {
    // Grant points first
    let state = wolfReducer(baseState, {
      type: 'GRANT_POINTS',
      wolfId: 'lobo-1',
      delta: 3,
    });

    // Unlock Bite 1d6
    state = wolfReducer(state, {
      type: 'UNLOCK_SKILL',
      wolfId: 'lobo-1',
      nodeId: 'combat_bite_1',
    });
    expect(state.wolves['lobo-1'].unlockedNodeIds).toContain('combat_bite_1');

    // Respec
    state = wolfReducer(state, {
      type: 'RESPEC',
      wolfId: 'lobo-1',
    });
    expect(state.wolves['lobo-1'].unlockedNodeIds.length).toBe(0);
    // Total skill points remain untouched
    expect(state.wolves['lobo-1'].totalSkillPoints).toBe(3);
  });

  it('handles ADD_FOOD and FEED_FOOD', () => {
    let state = wolfReducer(baseState, {
      type: 'ADD_FOOD',
      wolfId: 'lobo-1',
      delta: 3,
    });
    expect(state.wolves['lobo-1'].specialFoodCount).toBe(3);

    // Feed Str
    state = wolfReducer(state, {
      type: 'FEED_FOOD',
      wolfId: 'lobo-1',
      stat: 'str',
    });
    expect(state.wolves['lobo-1'].specialFoodCount).toBe(2);
    expect(state.wolves['lobo-1'].savingThrowPips.str).toBe(1);
  });
});
