import { describe, it, expect } from 'vitest';
import {
  calculateWolfStats,
  isNodeAvailable,
  getAvailableUpgrades,
  unlockNode,
  feedSpecialFood,
  respecWolf,
  createInitialWolf,
} from './rulesEngine';
import { SKILL_NODE_MAP } from './skillTreeData';

describe('Wolf Pet Skill Tree Rules Engine', () => {
  it('initializes wolf with correct D&D base stats', () => {
    const wolf = createInitialWolf();
    const stats = calculateWolfStats(wolf);

    expect(stats.ac).toBe(11);
    expect(stats.maxHp).toBe(5);
    expect(stats.speed).toBe(30);
    expect(stats.savingThrows.str).toBe(0);
    expect(stats.savingThrows.dex).toBe(1);
    expect(stats.savingThrows.con).toBe(0);
    expect(stats.savingThrows.int).toBe(-4);
    expect(stats.savingThrows.wis).toBe(1);
    expect(stats.savingThrows.cha).toBe(-2);
    expect(stats.level).toBe(0);
    expect(stats.availablePoints).toBe(0);
    expect(wolf.specialFoodCount).toBe(0);
  });

  it('provides root nodes as available upgrades for a fresh wolf', () => {
    const wolf = createInitialWolf();
    const available = getAvailableUpgrades(wolf);

    // Combat roots: Bite 1d6, AC 13, HP 15
    const combatRootIds = available.combat.map((n) => n.id);
    expect(combatRootIds).toContain('combat_bite_1');
    expect(combatRootIds).toContain('combat_ac_13');
    expect(combatRootIds).toContain('combat_hp_15');
    expect(combatRootIds).not.toContain('combat_bite_2'); // Locked!

    // Mobility roots: Speed 40ft, Dash Command, Deliver Messages
    const mobilityRootIds = available.mobility.map((n) => n.id);
    expect(mobilityRootIds).toContain('mobility_speed_40');
    expect(mobilityRootIds).toContain('mobility_dash');
    expect(mobilityRootIds).toContain('mobility_messages');

    // The unboxed Primeval Awareness heading is not a purchased root.
    const trackingRootIds = available.tracking.map((n) => n.id);
    expect(trackingRootIds).toContain('tracking_curiosity');
    expect(trackingRootIds).not.toContain('tracking_primeval_awareness');
    expect(trackingRootIds).toContain('tracking_search');
    expect(trackingRootIds).toContain('tracking_hide');

    // Emotional roots are the three lines entering Intelligence.
    const emotionalRootIds = available.emotional.map((n) => n.id);
    expect(emotionalRootIds).toContain('emotional_center_of_attention');
    expect(emotionalRootIds).toContain('emotional_short_rest_double');
    expect(emotionalRootIds).not.toContain('emotional_help');
    expect(emotionalRootIds).not.toContain('emotional_entertain_5');
    expect(emotionalRootIds).toContain('emotional_wisdom_save_d4');
    expect(emotionalRootIds).not.toContain('emotional_soothing_presence');
  });

  it('respects non-cumulative rules (takes the highest)', () => {
    let wolf = createInitialWolf();
    wolf.totalSkillPoints = 10;

    // Unlock AC 13 and AC 15
    wolf = unlockNode(wolf, 'combat_ac_13');
    let stats = calculateWolfStats(wolf);
    expect(stats.ac).toBe(13);

    wolf = unlockNode(wolf, 'combat_ac_15');
    stats = calculateWolfStats(wolf);
    expect(stats.ac).toBe(15);

    // Unlock HP 15, then HP 25, then HP 35
    wolf = unlockNode(wolf, 'combat_hp_15');
    wolf = unlockNode(wolf, 'combat_hp_25');
    wolf = unlockNode(wolf, 'combat_hp_35');
    stats = calculateWolfStats(wolf);
    expect(stats.maxHp).toBe(35);
  });

  it('unlocks downstream children only after parent node is unlocked', () => {
    let wolf = createInitialWolf();
    wolf.totalSkillPoints = 5;

    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('combat_bite_2')!)).toBe(false);

    wolf = unlockNode(wolf, 'combat_bite_1');
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('combat_bite_2')!)).toBe(true);
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('combat_relentless')!)).toBe(false);
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('combat_shove')!)).toBe(true);
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('combat_intimidation')!)).toBe(true);

    wolf = unlockNode(wolf, 'combat_bite_2');
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('combat_bite_3')!)).toBe(true);
  });

  it('supports alternative prerequisites (requiresAnyPrereq) for Hunter’s Mark', () => {
    let wolf = createInitialWolf();
    wolf.totalSkillPoints = 10;

    wolf = unlockNode(wolf, 'tracking_curiosity');
    wolf = unlockNode(wolf, 'tracking_helpful_fact');
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('tracking_hunters_mark')!)).toBe(false);

    // Unlock just Aberrations & Undead
    wolf = unlockNode(wolf, 'tracking_aberrations_undead');
    // Hunter's mark requires ANY of the three creature types!
    expect(isNodeAvailable(wolf, SKILL_NODE_MAP.get('tracking_hunters_mark')!)).toBe(true);
  });

  it('locks Apex skills until 10 points in that branch are attained', () => {
    let wolf = createInitialWolf();
    wolf.totalSkillPoints = 15;

    const apexFetch = SKILL_NODE_MAP.get('combat_apex_fetch')!;
    expect(isNodeAvailable(wolf, apexFetch)).toBe(false);

    // Spend 9 points in combat
    wolf = unlockNode(wolf, 'combat_bite_1');
    wolf = unlockNode(wolf, 'combat_bite_2');
    wolf = unlockNode(wolf, 'combat_bite_3');
    wolf = unlockNode(wolf, 'combat_shove');
    wolf = unlockNode(wolf, 'combat_grapple');
    wolf = unlockNode(wolf, 'combat_ac_13');
    wolf = unlockNode(wolf, 'combat_ac_15');
    wolf = unlockNode(wolf, 'combat_hp_15');
    wolf = unlockNode(wolf, 'combat_hp_25');

    expect(calculateWolfStats(wolf).branchPoints.combat).toBe(9);
    expect(isNodeAvailable(wolf, apexFetch)).toBe(false);

    // Unlock 10th point in combat
    wolf = unlockNode(wolf, 'combat_hp_35');
    expect(calculateWolfStats(wolf).branchPoints.combat).toBe(10);
    expect(isNodeAvailable(wolf, apexFetch)).toBe(true);
  });

  it('checks specific Apex prerequisites (e.g. Avoidance requires Evasion)', () => {
    let wolf = createInitialWolf();
    wolf.totalSkillPoints = 15;

    const apexAvoidance = SKILL_NODE_MAP.get('mobility_apex_avoidance')!;
    const apexColossus = SKILL_NODE_MAP.get('mobility_apex_colossus')!;

    // Gain 10 points in Mobility, but via Speed and Carry line without Evasion
    wolf = unlockNode(wolf, 'mobility_speed_40');
    wolf = unlockNode(wolf, 'mobility_speed_50');
    wolf = unlockNode(wolf, 'mobility_speed_60');
    wolf = unlockNode(wolf, 'mobility_jump_20');
    wolf = unlockNode(wolf, 'mobility_jump_30');
    wolf = unlockNode(wolf, 'mobility_jump_40');
    wolf = unlockNode(wolf, 'mobility_messages');
    wolf = unlockNode(wolf, 'mobility_potions');
    wolf = unlockNode(wolf, 'mobility_carry_small');
    wolf = unlockNode(wolf, 'mobility_carry_medium');

    expect(calculateWolfStats(wolf).branchPoints.mobility).toBe(10);
    // Colossus has no special node prereq -> available
    expect(isNodeAvailable(wolf, apexColossus)).toBe(true);
    // Avoidance specifically requires Evasion -> still false!
    expect(isNodeAvailable(wolf, apexAvoidance)).toBe(false);
  });

  it('updates saving throws with special food treats', () => {
    let wolf = createInitialWolf();
    wolf.specialFoodCount = 2; // granted by the DM

    // Base Wis is +1
    let stats = calculateWolfStats(wolf);
    expect(stats.savingThrows.wis).toBe(1);

    // Feed Wis special food
    wolf = feedSpecialFood(wolf, 'wis');
    expect(wolf.specialFoodCount).toBe(1);
    expect(wolf.savingThrowPips.wis).toBe(1);

    stats = calculateWolfStats(wolf);
    expect(stats.savingThrows.wis).toBe(2);

    // Feed Wis special food again
    wolf = feedSpecialFood(wolf, 'wis');
    expect(wolf.specialFoodCount).toBe(0);
    expect(wolf.savingThrowPips.wis).toBe(2);

    stats = calculateWolfStats(wolf);
    expect(stats.savingThrows.wis).toBe(3);

    // Cannot feed when count is 0
    expect(() => feedSpecialFood(wolf, 'wis')).toThrow();
  });

  it('allows respec to clear all spent skills without losing total points', () => {
    let wolf = createInitialWolf();
    wolf.totalSkillPoints = 5;

    wolf = unlockNode(wolf, 'combat_bite_1');
    wolf = unlockNode(wolf, 'combat_ac_13');
    expect(calculateWolfStats(wolf).spentPoints).toBe(2);
    expect(calculateWolfStats(wolf).availablePoints).toBe(3);

    wolf = respecWolf(wolf);
    expect(wolf.unlockedNodeIds.length).toBe(0);
    expect(calculateWolfStats(wolf).spentPoints).toBe(0);
    expect(calculateWolfStats(wolf).availablePoints).toBe(5);
  });
});
