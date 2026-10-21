export type SkillBranchId = 'combat' | 'mobility' | 'tracking' | 'emotional';

export type AbilityCategory = 
  | 'stat_boost' 
  | 'command' 
  | 'spell' 
  | 'passive' 
  | 'utility' 
  | 'apex';

export interface SkillNode {
  id: string;
  branch: SkillBranchId;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  category: AbilityCategory;
  isApex?: boolean;
  apexPointsRequired?: number; // usually 10
  prerequisites: string[]; // Node IDs that MUST be unlocked first (ALL or ANY depending on requiresAny)
  requiresAnyPrereq?: boolean; // if true, any one of prerequisites unlocks it
  // Stat modifier indicators
  modifiers?: {
    ac?: number;
    hp?: number;
    speed?: number;
    jump?: number;
    perceptionBonus?: number;
    stealthBonus?: number;
    performanceBonus?: number;
    biteDamage?: string; // e.g. "1d6", "2d6", "3d6"
    survivalBonusDie?: string; // "d4", "d6", "d8"
    wisdomSaveBonusDie?: string; // "d4", "d8", "d12"
  };
  // D&D Action type tag
  actionType?: 'action' | 'bonus_action' | 'reaction' | 'passive' | 'daily' | 'weekly';
}

export interface SavingThrows {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface SavingThrowPips {
  str: number; // 0 to 5
  dex: number; // 0 to 5
  con: number; // 0 to 5
  int: number; // 0 to 5
  wis: number; // 0 to 5
  cha: number; // 0 to 5
}

export interface WolfData {
  id: string;
  name: string;
  avatarUrl: string;
  totalSkillPoints: number; // Granted by DM (1 week downtime + 100gp = 1 point)
  unlockedNodeIds: string[];
  specialFoodCount: number; // Inventory of special foods
  savingThrowPips: SavingThrowPips;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalculatedWolfStats {
  level: number; // count of unlocked nodes
  spentPoints: number;
  availablePoints: number;
  ac: number;
  maxHp: number;
  speed: number;
  jump: number;
  savingThrows: SavingThrows;
  branchPoints: Record<SkillBranchId, number>;
  biteDamage: string | null;
  perceptionBonus: number;
  stealthBonus: number;
  performanceBonus: number;
  survivalBonusDie: string | null;
  wisdomSaveBonusDie: string | null;
  commands: {
    name: string;
    description: string;
    actionType: string;
  }[];
  passives: {
    name: string;
    description: string;
  }[];
  spellsAndDaily: {
    name: string;
    description: string;
    frequency: string;
  }[];
  apexSkills: {
    name: string;
    description: string;
    branch: SkillBranchId;
  }[];
}
