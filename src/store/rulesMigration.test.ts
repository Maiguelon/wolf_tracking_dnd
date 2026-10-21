import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialWolf } from '../engine/rulesEngine';
import { getInitialState, saveStateToStorage, STORAGE_KEY, wolfReducer } from './wolfStore';

afterEach(() => vi.unstubAllGlobals());

function browserStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  return values;
}

describe('Saved campaign upgrade and recovery', () => {
  it('backs up the exact original before migrating and preserves the selected wolf', () => {
    const values = browserStorage();
    const wolf = {
      ...createInitialWolf('fenrir', 'Fenrir'), rulesVersion: undefined, totalSkillPoints: 7,
      specialFoodCount: 4, unlockedNodeIds: ['emotional_help'],
    };
    const original = JSON.stringify({ wolves: { fenrir: wolf }, activeWolfId: 'fenrir' });
    values.set(STORAGE_KEY, original);
    const state = getInitialState();
    expect(values.get(`${STORAGE_KEY}_before_rules_v2`)).toBe(original);
    expect(state.activeWolfId).toBe('fenrir');
    expect(state.wolves.fenrir.unlockedNodeIds).toEqual([]);
    expect(state.wolves.fenrir.totalSkillPoints).toBe(7);
    expect(state.wolves.fenrir.specialFoodCount).toBe(4);
    expect(state.wolves.fenrir.rulesMigration?.removedSkills).toEqual(['Comando de Ayuda']);
    saveStateToStorage(state);
    const reloaded = getInitialState();
    expect(reloaded).toEqual(state);
    expect(values.get(`${STORAGE_KEY}_before_rules_v2`)).toBe(original);
  });

  it('never overwrites an existing recovery copy', () => {
    const values = browserStorage();
    values.set(`${STORAGE_KEY}_before_rules_v2`, 'original recovery copy');
    const wolf = { ...createInitialWolf(), rulesVersion: 1 };
    values.set(STORAGE_KEY, JSON.stringify({ wolves: { [wolf.id]: wolf }, activeWolfId: wolf.id }));
    getInitialState();
    expect(values.get(`${STORAGE_KEY}_before_rules_v2`)).toBe('original recovery copy');
  });

  it('dismisses the explanation without changing campaign resources or the backup', () => {
    const values = browserStorage();
    values.set(`${STORAGE_KEY}_before_rules_v2`, 'original recovery copy');
    const wolf = {
      ...createInitialWolf(), totalSkillPoints: 9, specialFoodCount: 3,
      rulesMigration: { removedSkills: ['Comando de Ayuda'] },
    };
    const state = wolfReducer({ wolves: { [wolf.id]: wolf }, activeWolfId: wolf.id }, {
      type: 'ACKNOWLEDGE_RULES_UPDATE', wolfId: wolf.id,
    });
    expect(state.wolves[wolf.id].rulesMigration).toBeUndefined();
    expect(state.wolves[wolf.id].totalSkillPoints).toBe(9);
    expect(state.wolves[wolf.id].specialFoodCount).toBe(3);
    expect(values.get(`${STORAGE_KEY}_before_rules_v2`)).toBe('original recovery copy');
  });
});
