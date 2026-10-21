import { describe, expect, it } from 'vitest';
import type { WolfData } from '../types/wolf';
import { SKILL_NODE_MAP, SKILL_TREE_NODES } from './skillTreeData';
import {
  calculateWolfStats, createInitialWolf, feedSpecialFood, getAvailableUpgrades,
  getSkillCost, isNodeAvailable, migrateWolfRules, respecWolf, unlockNode,
} from './rulesEngine';
import { wolfReducer } from '../store/wolfStore';

function trained(ids: string[], points = 100): WolfData {
  return ids.reduce(unlockNode, { ...createInitialWolf(), totalSkillPoints: points });
}

const combatTen = [
  'combat_bite_1', 'combat_bite_2', 'combat_bite_3', 'combat_shove', 'combat_grapple',
  'combat_ac_13', 'combat_ac_15', 'combat_ac_17', 'combat_ac_19', 'combat_hp_15',
];

describe('Progression traced from the supplied Wolf Pet Skill Tree sheet', () => {
  it('has exactly the boxed skills, unique IDs, and valid acyclic prerequisites', () => {
    expect(SKILL_TREE_NODES).toHaveLength(76);
    expect(SKILL_NODE_MAP.size).toBe(76);
    expect(SKILL_NODE_MAP.has('tracking_primeval_awareness')).toBe(false);
    const visit = (id: string, ancestors: string[]) => {
      expect(ancestors).not.toContain(id);
      const node = SKILL_NODE_MAP.get(id);
      expect(node).toBeDefined();
      for (const parent of node!.prerequisites) visit(parent, [...ancestors, id]);
    };
    for (const node of SKILL_TREE_NODES) visit(node.id, []);
  });

  it('starts only at the lines connected to the top of each branch', () => {
    const roots = getAvailableUpgrades(createInitialWolf());
    expect(roots.combat.map(n => n.id)).toEqual(['combat_bite_1', 'combat_ac_13', 'combat_hp_15']);
    expect(roots.mobility.map(n => n.id)).toEqual(['mobility_speed_40', 'mobility_dash', 'mobility_messages']);
    expect(roots.tracking.map(n => n.id)).toEqual(['tracking_curiosity', 'tracking_search', 'tracking_hide']);
    expect(roots.emotional.map(n => n.id)).toEqual([
      'emotional_center_of_attention', 'emotional_short_rest_double', 'emotional_wisdom_save_d4',
    ]);
  });

  it('branches Shove and Intimidation off the first Bite, and Relentless off HP 45', () => {
    const bite = trained(['combat_bite_1']);
    for (const id of ['combat_bite_2', 'combat_shove', 'combat_intimidation']) {
      expect(isNodeAvailable(bite, SKILL_NODE_MAP.get(id)!)).toBe(true);
    }
    expect(isNodeAvailable(bite, SKILL_NODE_MAP.get('combat_relentless')!)).toBe(false);
    const hp = trained(['combat_hp_15', 'combat_hp_25', 'combat_hp_35', 'combat_hp_45']);
    expect(isNodeAvailable(hp, SKILL_NODE_MAP.get('combat_relentless')!)).toBe(true);
    expect(isNodeAvailable(hp, SKILL_NODE_MAP.get('combat_intimidation')!)).toBe(false);
  });

  it.each(['emotional_center_of_attention', 'emotional_short_rest_double', 'emotional_wisdom_save_d4'])(
    'allows Intelligence through the alternative path %s', root => {
      let wolf = trained([root]);
      expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('emotional_intelligence')!)).toBe(true);
      for (const id of ['emotional_help', 'emotional_entertain_5', 'emotional_soothing_presence']) {
        expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get(id)!)).toBe(false);
      }
      wolf = unlockNode(wolf, 'emotional_intelligence');
      for (const id of ['emotional_help', 'emotional_entertain_5', 'emotional_soothing_presence']) {
        expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get(id)!)).toBe(true);
      }
    },
  );

  it('branches Inspiration directly off the first comforting rest', () => {
    const wolf = trained(['emotional_short_rest_double']);
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('emotional_rest_inspiration')!)).toBe(true);
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('emotional_rest_entire_party')!)).toBe(false);
  });

  it.each(['tracking_celestials_fiends', 'tracking_aberrations_undead', 'tracking_dragons_fey_elementals'])(
    'trains %s after Helpful Fact and then enables Mark', id => {
      let wolf = trained(['tracking_curiosity']);
      expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get(id)!)).toBe(false);
      wolf = unlockNode(wolf, 'tracking_helpful_fact');
      wolf = unlockNode(wolf, id);
      expect(calculateWolfStats(wolf).spentPoints).toBe(3);
      expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('tracking_hunters_mark')!)).toBe(true);
    },
  );

  it('charges two points per Apex in all four branches', () => {
    expect(SKILL_TREE_NODES.filter(n => n.isApex)).toHaveLength(12);
    for (const node of SKILL_TREE_NODES) expect(getSkillCost(node)).toBe(node.isApex ? 2 : 1);
    const onePointLeft = trained(combatTen, 11);
    expect(isNodeAvailable(onePointLeft, SKILL_NODE_MAP.get('combat_apex_fetch')!)).toBe(true);
    expect(() => unlockNode(onePointLeft, 'combat_apex_fetch')).toThrow('2 puntos');
    const wolf = unlockNode({ ...onePointLeft, totalSkillPoints: 12 }, 'combat_apex_fetch');
    expect(calculateWolfStats(wolf)).toMatchObject({
      level: 12, spentPoints: 12, availablePoints: 0, learnedSkillCount: 11,
      branchPoints: { combat: 12 },
    });
    const state = wolfReducer({ wolves: { [wolf.id]: wolf }, activeWolfId: wolf.id }, {
      type: 'GRANT_POINTS', wolfId: wolf.id, delta: -20,
    });
    expect(state.wolves[wolf.id].totalSkillPoints).toBe(12);
    expect(calculateWolfStats(respecWolf(wolf)).availablePoints).toBe(12);
  });

  it('shows one triggered Bite with its highest damage and the Feral range/trigger', () => {
    const wolf = unlockNode(trained(combatTen), 'combat_apex_feral_bite');
    const stats = calculateWolfStats({ ...wolf, unlockedNodeIds: [...wolf.unlockedNodeIds].reverse() });
    expect(stats.biteDamage).toBe('3d6');
    expect(stats.biteRange).toBe(10);
    expect(stats.biteTrigger).toBe('Cuando tú o un aliado infligen daño');
    expect(stats.commands.some(c => c.name.includes('Mordisco'))).toBe(false);
    const bites = stats.passives.filter(p => p.name.startsWith('Mordisco'));
    expect(bites).toHaveLength(1);
    expect(bites[0].description).toContain('10 pies');
    expect(bites[0].description).toContain('3d6');
    expect(stats.apexSkills.filter(p => p.name === 'Mordisco Feral')).toHaveLength(1);
  });

  it('keeps only the highest non-cumulative bonuses, even with reordered saved nodes', () => {
    const wolf = trained([
      'tracking_curiosity', 'tracking_survival_d4', 'tracking_survival_d6', 'tracking_survival_d8',
      'emotional_wisdom_save_d4', 'emotional_wisdom_save_d8', 'emotional_wisdom_save_d12',
      'tracking_search', 'tracking_search_7', 'tracking_search_9',
      'tracking_hide', 'tracking_hide_7', 'tracking_hide_9',
    ]);
    const stats = calculateWolfStats({ ...wolf, unlockedNodeIds: [...wolf.unlockedNodeIds].reverse() });
    expect(stats.survivalBonusDie).toBe('d8');
    expect(stats.wisdomSaveBonusDie).toBe('d12');
    expect(stats.spellsAndDaily.filter(s => s.name.includes('Sabiduría') || s.name.includes('Guarda Mental'))).toHaveLength(1);
    expect(stats.commands.find(c => c.name.startsWith('Comando de Buscar'))?.description).toContain('+9');
    expect(stats.commands.find(c => c.name.startsWith('Comando de Esconderse'))?.description).toContain('+9');
  });

  it('retains the daily limit and bonus action for Mark without listing it twice', () => {
    const stats = calculateWolfStats(trained([
      'tracking_curiosity', 'tracking_helpful_fact', 'tracking_celestials_fiends', 'tracking_hunters_mark',
    ]));
    expect(stats.spellsAndDaily.find(s => s.name.startsWith('Marca'))).toMatchObject({
      frequency: '1/día', actionType: 'Acción Adicional',
    });
    expect(stats.commands.some(c => c.name.startsWith('Marca'))).toBe(false);
  });

  it('starts with no free resources and enforces all five food slots', () => {
    let wolf = createInitialWolf();
    expect(wolf.totalSkillPoints).toBe(0);
    expect(wolf.specialFoodCount).toBe(0);
    expect(() => unlockNode(wolf, 'combat_bite_1')).toThrow();
    wolf.specialFoodCount = 6;
    for (let i = 0; i < 5; i++) wolf = feedSpecialFood(wolf, 'wis');
    expect(calculateWolfStats(wolf).savingThrows.wis).toBe(6);
    expect(() => feedSpecialFood(wolf, 'wis')).toThrow('máximo de 5');
  });
});

describe('Existing campaign saves under corrected rules', () => {
  it('preserves resources, refunds invalid paths, and is idempotent', () => {
    const original: WolfData = {
      ...createInitialWolf('old-wolf', 'Fenrir'), rulesVersion: undefined,
      totalSkillPoints: 10, specialFoodCount: 7,
      savingThrowPips: { str: 1, dex: 2, con: 0, int: 0, wis: 3, cha: 0 },
      unlockedNodeIds: ['combat_bite_1', 'combat_relentless', 'emotional_help', 'tracking_primeval_awareness'],
    };
    const migrated = migrateWolfRules(original);
    expect(migrated.unlockedNodeIds).toEqual(['combat_bite_1']);
    expect(migrated.totalSkillPoints).toBe(10);
    expect(migrated.specialFoodCount).toBe(7);
    expect(migrated.savingThrowPips).toEqual(original.savingThrowPips);
    expect(calculateWolfStats(migrated).availablePoints).toBe(9);
    expect(migrated.rulesMigration?.removedSkills).toHaveLength(3);
    expect(original.unlockedNodeIds).toHaveLength(4);
    expect(migrateWolfRules(migrated)).toBe(migrated);
  });

  it('preserves valid paths even when saved out of order', () => {
    const original = trained(['combat_hp_15', 'combat_hp_25', 'combat_hp_35', 'combat_hp_45', 'combat_relentless']);
    const migrated = migrateWolfRules({
      ...original, rulesVersion: 1, unlockedNodeIds: [...original.unlockedNodeIds].reverse(),
    });
    expect(new Set(migrated.unlockedNodeIds)).toEqual(new Set(original.unlockedNodeIds));
    expect(migrated.rulesMigration).toBeUndefined();
  });

  it('refunds an old Apex when the extra point is unavailable', () => {
    const old = { ...trained(combatTen, 11), rulesVersion: 1, unlockedNodeIds: [...combatTen, 'combat_apex_fetch'] };
    const migrated = migrateWolfRules(old);
    expect(migrated.unlockedNodeIds).toEqual(combatTen);
    expect(calculateWolfStats(migrated).availablePoints).toBe(1);
    expect(migrated.rulesMigration?.removedSkills).toContain('¡Tráelo!');
  });

  it('keeps an old Apex when its full cost is affordable', () => {
    const old = { ...trained(combatTen, 12), rulesVersion: 1, unlockedNodeIds: [...combatTen, 'combat_apex_fetch'] };
    const migrated = migrateWolfRules(old);
    expect(migrated.unlockedNodeIds).toContain('combat_apex_fetch');
    expect(calculateWolfStats(migrated).spentPoints).toBe(12);
    expect(calculateWolfStats(migrated).availablePoints).toBe(0);
  });
});
