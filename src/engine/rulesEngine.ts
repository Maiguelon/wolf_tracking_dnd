import type {
  WolfData,
  CalculatedWolfStats,
  SkillBranchId,
  SkillNode,
  SavingThrowPips,
} from '../types/wolf';
import {
  SKILL_TREE_NODES,
  SKILL_NODE_MAP,
  BASE_WOLF_STATS,
} from './skillTreeData';

export const RULES_VERSION = 2;

export function getSkillCost(node: SkillNode): number {
  return node.cost ?? (node.isApex ? 2 : 1);
}

export function getSkillFrequency(node: SkillNode): string | undefined {
  const frequency = node.frequency ?? node.actionType;
  if (frequency === 'daily') return '1/día';
  if (frequency === 'weekly') return '1/semana';
  return undefined;
}

export function getSpentPoints(wolf: WolfData): number {
  return [...new Set(wolf.unlockedNodeIds)].reduce((total, id) => {
    const node = SKILL_NODE_MAP.get(id);
    return total + (node ? getSkillCost(node) : 0);
  }, 0);
}

export function calculateWolfStats(wolf: WolfData): CalculatedWolfStats {
  const nodes = [...new Set(wolf.unlockedNodeIds)]
    .map(id => SKILL_NODE_MAP.get(id))
    .filter((node): node is SkillNode => !!node);
  const spentPoints = getSpentPoints(wolf);
  const availablePoints = Math.max(0, wolf.totalSkillPoints - spentPoints);

  const branchPoints: Record<SkillBranchId, number> = {
    combat: 0,
    mobility: 0,
    tracking: 0,
    emotional: 0,
  };

  let maxAc = BASE_WOLF_STATS.ac;
  let maxHp = BASE_WOLF_STATS.hp;
  let maxSpeed = BASE_WOLF_STATS.speed;
  let maxJump = BASE_WOLF_STATS.jump;
  let maxPerception = 0;
  let maxStealth = 0;
  let maxPerformance = 0;

  let biteDamage: string | null = null;
  let survivalBonusDie: string | null = null;
  let wisdomSaveBonusDie: string | null = null;

  const commands: CalculatedWolfStats['commands'] = [];
  const passives: CalculatedWolfStats['passives'] = [];
  const spellsAndDaily: CalculatedWolfStats['spellsAndDaily'] = [];
  const apexSkills: CalculatedWolfStats['apexSkills'] = [];

  const highestDie = (current: string | null, next: string): string => {
    const size = (die: string) => Number(die.replace(/^.*d/, ''));
    return !current || size(next) > size(current) ? next : current;
  };

  for (const node of nodes) {
    branchPoints[node.branch] += getSkillCost(node);

    // Highest non-cumulative modifiers
    if (node.modifiers?.ac && node.modifiers.ac > maxAc) {
      maxAc = node.modifiers.ac;
    }
    if (node.modifiers?.hp && node.modifiers.hp > maxHp) {
      maxHp = node.modifiers.hp;
    }
    if (node.modifiers?.speed && node.modifiers.speed > maxSpeed) {
      maxSpeed = node.modifiers.speed;
    }
    if (node.modifiers?.jump && node.modifiers.jump > maxJump) {
      maxJump = node.modifiers.jump;
    }
    if (node.modifiers?.perceptionBonus && node.modifiers.perceptionBonus > maxPerception) {
      maxPerception = node.modifiers.perceptionBonus;
    }
    if (node.modifiers?.stealthBonus && node.modifiers.stealthBonus > maxStealth) {
      maxStealth = node.modifiers.stealthBonus;
    }
    if (node.modifiers?.performanceBonus && node.modifiers.performanceBonus > maxPerformance) {
      maxPerformance = node.modifiers.performanceBonus;
    }

    if (node.modifiers?.biteDamage) {
      if (!biteDamage || parseInt(node.modifiers.biteDamage) > parseInt(biteDamage)) {
        biteDamage = node.modifiers.biteDamage;
      }
    }
    if (node.modifiers?.survivalBonusDie) {
      survivalBonusDie = highestDie(survivalBonusDie, node.modifiers.survivalBonusDie);
    }
    if (node.modifiers?.wisdomSaveBonusDie) {
      wisdomSaveBonusDie = highestDie(wisdomSaveBonusDie, node.modifiers.wisdomSaveBonusDie);
    }
  }

  const feralBite = wolf.unlockedNodeIds.includes('combat_apex_feral_bite');
  const biteRange = feralBite ? 10 : 5;
  const biteTrigger = feralBite ? 'Cuando tú o un aliado infligen daño' : 'Cuando infliges daño';

  for (const node of nodes) {
    // Upgrade tiers remain purchased, but the sheet shows only the current effect.
    if (node.modifiers?.biteDamage) continue;
    if (node.modifiers?.wisdomSaveBonusDie && node.modifiers.wisdomSaveBonusDie !== wisdomSaveBonusDie) continue;
    if (node.modifiers?.performanceBonus && node.modifiers.performanceBonus !== maxPerformance) continue;
    if (node.id === 'emotional_short_rest_double' && wolf.unlockedNodeIds.includes('emotional_rest_two_creatures')) continue;
    if (node.id === 'emotional_rest_two_creatures' && wolf.unlockedNodeIds.includes('emotional_rest_entire_party')) continue;
    if (node.id === 'mobility_carry_small' && wolf.unlockedNodeIds.includes('mobility_carry_medium')) continue;
    if (node.id === 'mobility_carry_medium' && wolf.unlockedNodeIds.includes('mobility_carry_two_medium')) continue;

    let name = node.nameEs;
    let description = node.descriptionEs;
    if (node.id === 'tracking_search') {
      name = `Comando de Buscar (+${maxPerception})`;
      description = `Comando de Buscar (Acción Adicional). Percepción +${maxPerception}.`;
    } else if (node.id === 'tracking_hide') {
      name = `Comando de Esconderse (+${maxStealth})`;
      description = `Comando de Esconderse (Acción Adicional). Sigilo +${maxStealth}.`;
    } else if (node.modifiers?.performanceBonus) {
      name = `Animador de Taberna (+${maxPerformance})`;
      description = `Tu lobo puede entretener a la gente y ganar oro. Interpretación +${maxPerformance}.`;
    }

    // Categorized abilities
    if (node.isApex) {
      apexSkills.push({
        name,
        description,
        branch: node.branch,
      });
      continue;
    }

    const frequency = getSkillFrequency(node);
    if (frequency) {
      spellsAndDaily.push({
        name,
        description,
        frequency,
        actionType: node.actionType === 'bonus_action' ? 'Acción Adicional' : undefined,
      });
    } else if (node.actionType === 'bonus_action' || node.category === 'command') {
      commands.push({
        name,
        description,
        actionType: 'Acción Adicional',
      });
    } else if (node.category === 'passive' || node.category === 'utility' || node.modifiers?.performanceBonus) {
      passives.push({
        name,
        description,
      });
    }
  }

  if (biteDamage) {
    passives.unshift({
      name: `Mordisco (${biteDamage})`,
      description: `${biteTrigger} a una criatura y tu lobo está a ${biteRange} pies de ella, infliges ${biteDamage} de daño perforante adicional (1/turno).`,
    });
  }

  // Calculate saving throws: base + pips
  const pips = wolf.savingThrowPips || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const savingThrows = {
    str: BASE_WOLF_STATS.savingThrows.str + (pips.str || 0),
    dex: BASE_WOLF_STATS.savingThrows.dex + (pips.dex || 0),
    con: BASE_WOLF_STATS.savingThrows.con + (pips.con || 0),
    int: BASE_WOLF_STATS.savingThrows.int + (pips.int || 0),
    wis: BASE_WOLF_STATS.savingThrows.wis + (pips.wis || 0),
    cha: BASE_WOLF_STATS.savingThrows.cha + (pips.cha || 0),
  };

  return {
    level: spentPoints,
    learnedSkillCount: nodes.length,
    spentPoints,
    availablePoints,
    ac: maxAc,
    maxHp: maxHp,
    speed: maxSpeed,
    jump: maxJump,
    savingThrows,
    branchPoints,
    biteDamage,
    biteRange,
    biteTrigger,
    perceptionBonus: maxPerception,
    stealthBonus: maxStealth,
    performanceBonus: maxPerformance,
    survivalBonusDie,
    wisdomSaveBonusDie,
    commands,
    passives,
    spellsAndDaily,
    apexSkills,
  };
}

export function isNodeAvailable(wolf: WolfData, node: SkillNode): boolean {
  if (wolf.unlockedNodeIds.includes(node.id)) {
    return false; // Already unlocked
  }

  const unlockedSet = new Set(wolf.unlockedNodeIds);

  // If Apex skill: requires 10 points in its branch + specific prerequisites if any
  if (node.isApex) {
    const requiredPoints = node.apexPointsRequired ?? 10;
    const branchCount = calculateWolfStats(wolf).branchPoints[node.branch];

    if (branchCount < requiredPoints) {
      return false;
    }

    if (node.prerequisites && node.prerequisites.length > 0) {
      const hasAllPrereqs = node.prerequisites.every((req) => unlockedSet.has(req));
      if (!hasAllPrereqs) return false;
    }

    return true;
  }

  // Non-Apex node
  if (node.prerequisites.length === 0) {
    return true; // Root node
  }

  if (node.requiresAnyPrereq) {
    return node.prerequisites.some((req) => unlockedSet.has(req));
  }

  return node.prerequisites.every((req) => unlockedSet.has(req));
}

export function getAvailableUpgrades(wolf: WolfData): Record<SkillBranchId, SkillNode[]> {
  const result: Record<SkillBranchId, SkillNode[]> = {
    combat: [],
    mobility: [],
    tracking: [],
    emotional: [],
  };

  for (const node of SKILL_TREE_NODES) {
    if (isNodeAvailable(wolf, node)) {
      result[node.branch].push(node);
    }
  }

  return result;
}

export function unlockNode(wolf: WolfData, nodeId: string): WolfData {
  const node = SKILL_NODE_MAP.get(nodeId);
  if (!node) throw new Error(`Habilidad desconocida: ${nodeId}`);

  const stats = calculateWolfStats(wolf);
  if (stats.availablePoints < getSkillCost(node)) {
    throw new Error(`Se necesitan ${getSkillCost(node)} puntos de habilidad`);
  }

  if (!isNodeAvailable(wolf, node)) {
    throw new Error(`Los requisitos para la habilidad "${node.nameEs}" no se cumplen`);
  }

  return {
    ...wolf,
    unlockedNodeIds: [...wolf.unlockedNodeIds, nodeId],
    updatedAt: Date.now(),
  };
}

export function feedSpecialFood(wolf: WolfData, stat: keyof SavingThrowPips): WolfData {
  if (wolf.specialFoodCount <= 0) {
    throw new Error('No queda comida especial disponible');
  }

  const currentPips = wolf.savingThrowPips[stat] || 0;
  if (currentPips >= 5) {
    throw new Error(`La tirada de salvación de ${stat.toUpperCase()} ya alcanzó el máximo de 5 mejoras`);
  }

  return {
    ...wolf,
    specialFoodCount: wolf.specialFoodCount - 1,
    savingThrowPips: {
      ...wolf.savingThrowPips,
      [stat]: currentPips + 1,
    },
    updatedAt: Date.now(),
  };
}

export function respecWolf(wolf: WolfData): WolfData {
  return {
    ...wolf,
    unlockedNodeIds: [],
    updatedAt: Date.now(),
  };
}

export function createInitialWolf(id = 'lobo-1', name = 'Lobo Compañero'): WolfData {
  return {
    id,
    name,
    avatarUrl: '/avatars/wolf_gray.png',
    rulesVersion: RULES_VERSION,
    totalSkillPoints: 0,
    unlockedNodeIds: [],
    specialFoodCount: 0,
    savingThrowPips: {
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
    },
    notes: 'Compañero leal del grupo.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Keep earned resources and valid purchases when loading pre-correction saves.
export function migrateWolfRules(wolf: WolfData): WolfData {
  if ((wolf.rulesVersion ?? 1) >= RULES_VERSION) return wolf;

  let migrated: WolfData = { ...wolf, unlockedNodeIds: [], rulesVersion: RULES_VERSION };
  let pending = [...new Set(wolf.unlockedNodeIds)];
  let progressed = true;
  while (progressed && pending.length) {
    progressed = false;
    const remaining: string[] = [];
    for (const id of pending) {
      const node = SKILL_NODE_MAP.get(id);
      if (node && isNodeAvailable(migrated, node) &&
          calculateWolfStats(migrated).availablePoints >= getSkillCost(node)) {
        migrated = { ...migrated, unlockedNodeIds: [...migrated.unlockedNodeIds, id] };
        progressed = true;
      } else {
        remaining.push(id);
      }
    }
    pending = remaining;
  }

  const changed = pending.length > 0 || getSpentPoints(migrated) !== wolf.unlockedNodeIds.length;
  return {
    ...migrated,
    updatedAt: Date.now(),
    rulesMigration: changed ? {
      removedSkills: pending.map(id => id === 'tracking_primeval_awareness'
        ? 'Sentido Primitivo (encabezado sin coste)'
        : SKILL_NODE_MAP.get(id)?.nameEs ?? id),
    } : undefined,
  };
}
