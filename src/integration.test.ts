import { describe, it, expect } from 'vitest';
import { wolfReducer } from './store/wolfStore';
import type { AppState } from './store/wolfStore';
import { calculateWolfStats, getAvailableUpgrades } from './engine/rulesEngine';

describe('End-to-End Game Session Flow', () => {
  it('simulates a complete campaign progression between DM and Player', () => {
    // 1. Initial State with default wolf
    let state: AppState = {
      wolves: {},
      activeWolfId: '',
    };

    // 2. DM creates "Fenrir"
    state = wolfReducer(state, {
      type: 'ADD_WOLF',
      name: 'Fenrir',
      avatarUrl: '/avatars/wolf_white.png',
    });

    const fenrirId = state.activeWolfId;
    expect(state.wolves[fenrirId].name).toBe('Fenrir');
    expect(state.wolves[fenrirId].avatarUrl).toBe('/avatars/wolf_white.png');

    // 3. DM grants 3 skill points and 3 special food treats
    state = wolfReducer(state, {
      type: 'GRANT_POINTS',
      wolfId: fenrirId,
      delta: 3,
    });
    state = wolfReducer(state, {
      type: 'ADD_FOOD',
      wolfId: fenrirId,
      delta: 3,
    });

    let fenrir = state.wolves[fenrirId];
    let stats = calculateWolfStats(fenrir);
    expect(fenrir.totalSkillPoints).toBe(3);
    expect(stats.availablePoints).toBe(3);
    expect(fenrir.specialFoodCount).toBe(3);

    // 4. Player inspects available immediate upgrades
    let available = getAvailableUpgrades(fenrir);
    expect(available.combat.map((n) => n.id)).toContain('combat_bite_1');
    expect(available.mobility.map((n) => n.id)).toContain('mobility_dash');

    // 5. Player learns Combat Bite (1d6) and Mobility Dash
    state = wolfReducer(state, {
      type: 'UNLOCK_SKILL',
      wolfId: fenrirId,
      nodeId: 'combat_bite_1',
    });
    state = wolfReducer(state, {
      type: 'UNLOCK_SKILL',
      wolfId: fenrirId,
      nodeId: 'mobility_dash',
    });

    fenrir = state.wolves[fenrirId];
    stats = calculateWolfStats(fenrir);

    expect(stats.spentPoints).toBe(2);
    expect(stats.availablePoints).toBe(1);
    expect(stats.biteDamage).toBe('1d6');
    expect(stats.commands.map((c) => c.name)).toContain('Comando de Carrera');

    // 6. Upgrades automatically advance along branches
    available = getAvailableUpgrades(fenrir);
    expect(available.combat.map((n) => n.id)).toContain('combat_bite_2');
    expect(available.combat.map((n) => n.id)).not.toContain('combat_relentless');
    expect(available.combat.map((n) => n.id)).toContain('combat_shove');
    expect(available.mobility.map((n) => n.id)).toContain('mobility_disengage');

    // 7. Player feeds 2 special foods to Dexterity
    state = wolfReducer(state, {
      type: 'FEED_FOOD',
      wolfId: fenrirId,
      stat: 'dex',
    });
    state = wolfReducer(state, {
      type: 'FEED_FOOD',
      wolfId: fenrirId,
      stat: 'dex',
    });

    fenrir = state.wolves[fenrirId];
    stats = calculateWolfStats(fenrir);
    // Base Dex save is +1, fed 2 pips -> becomes +3
    expect(stats.savingThrows.dex).toBe(3);
    expect(fenrir.specialFoodCount).toBe(1);

    // 8. Player mistakenly learns Bite 2d6, asks DM for Respec
    state = wolfReducer(state, {
      type: 'UNLOCK_SKILL',
      wolfId: fenrirId,
      nodeId: 'combat_bite_2',
    });
    expect(calculateWolfStats(state.wolves[fenrirId]).spentPoints).toBe(3);

    // DM executes Respec
    state = wolfReducer(state, {
      type: 'RESPEC',
      wolfId: fenrirId,
    });

    fenrir = state.wolves[fenrirId];
    stats = calculateWolfStats(fenrir);

    // All three earned points are refunded, food improvements are retained.
    expect(fenrir.unlockedNodeIds.length).toBe(0);
    expect(stats.spentPoints).toBe(0);
    expect(stats.availablePoints).toBe(3);
    // Special food benefits remain intact through respec
    expect(stats.savingThrows.dex).toBe(3);

    // 9. Player reallocates into Mobility speed path
    state = wolfReducer(state, {
      type: 'UNLOCK_SKILL',
      wolfId: fenrirId,
      nodeId: 'mobility_speed_40',
    });
    state = wolfReducer(state, {
      type: 'UNLOCK_SKILL',
      wolfId: fenrirId,
      nodeId: 'mobility_speed_50',
    });

    stats = calculateWolfStats(state.wolves[fenrirId]);
    expect(stats.speed).toBe(50); // Highest non-cumulative speed
    expect(stats.availablePoints).toBe(1);
  });
});
