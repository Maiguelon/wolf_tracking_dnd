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

export function calculateWolfStats(wolf: WolfData): CalculatedWolfStats {
  const spentPoints = wolf.unlockedNodeIds.length;
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

  for (const nodeId of wolf.unlockedNodeIds) {
    const node = SKILL_NODE_MAP.get(nodeId);
    if (!node) continue;

    // Count branch points
    branchPoints[node.branch] = (branchPoints[node.branch] || 0) + 1;

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
      // Pick highest dice
      biteDamage = node.modifiers.biteDamage;
    }
    if (node.modifiers?.survivalBonusDie) {
      survivalBonusDie = node.modifiers.survivalBonusDie;
    }
    if (node.modifiers?.wisdomSaveBonusDie) {
      wisdomSaveBonusDie = node.modifiers.wisdomSaveBonusDie;
    }

    // Categorized abilities
    if (node.isApex) {
      apexSkills.push({
        name: node.nameEs,
        description: node.descriptionEs,
        branch: node.branch,
      });
    }

    if (node.actionType === 'bonus_action' || node.category === 'command') {
      commands.push({
        name: node.nameEs,
        description: node.descriptionEs,
        actionType: 'Acción Adicional',
      });
    } else if (node.actionType === 'daily' || node.actionType === 'weekly' || node.category === 'spell') {
      spellsAndDaily.push({
        name: node.nameEs,
        description: node.descriptionEs,
        frequency: node.actionType === 'weekly' ? '1/semana' : '1/día',
      });
    } else if (node.category === 'passive' || node.category === 'utility') {
      passives.push({
        name: node.nameEs,
        description: node.descriptionEs,
      });
    }
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
    spentPoints,
    availablePoints,
    ac: maxAc,
    maxHp: maxHp,
    speed: maxSpeed,
    jump: maxJump,
    savingThrows,
    branchPoints,
    biteDamage,
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
    const branchCount = wolf.unlockedNodeIds.filter((id) => {
      const n = SKILL_NODE_MAP.get(id);
      return n?.branch === node.branch;
    }).length;

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
  if (stats.availablePoints <= 0) {
    throw new Error('No hay puntos de habilidad disponibles');
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
    avatarUrl: '/avatars/wolf_gray.jpg',
    totalSkillPoints: 1, // 1 starting point to try out
    unlockedNodeIds: [],
    specialFoodCount: 2, // 2 starting treats
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
