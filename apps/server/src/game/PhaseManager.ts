import type { GamePhase } from '@mafia-night/shared';

export const PHASE_DURATIONS: Partial<Record<GamePhase, number>> = {
  ROLE_REVEAL:     8000,
  NIGHT_START:     3000,
  NIGHT_MAFIA:     30000,
  NIGHT_DETECTIVE: 20000,
  NIGHT_DOCTOR:    20000,
  NIGHT_RESULTS:   5000,
  DAY_DISCUSSION:  90000,
  DAY_VOTING:      30000,
  DAY_ELIMINATION: 5000,
};

export function getNextPhase(current: GamePhase, hasDetective: boolean, hasDoctor: boolean): GamePhase {
  switch (current) {
    case 'LOBBY':          return 'ROLE_REVEAL';
    case 'ROLE_REVEAL':    return 'NIGHT_START';
    case 'NIGHT_START':    return 'NIGHT_MAFIA';
    case 'NIGHT_MAFIA':    return hasDetective ? 'NIGHT_DETECTIVE' : (hasDoctor ? 'NIGHT_DOCTOR' : 'NIGHT_RESULTS');
    case 'NIGHT_DETECTIVE': return hasDoctor ? 'NIGHT_DOCTOR' : 'NIGHT_RESULTS';
    case 'NIGHT_DOCTOR':   return 'NIGHT_RESULTS';
    case 'NIGHT_RESULTS':  return 'DAY_DISCUSSION';
    case 'DAY_DISCUSSION': return 'DAY_VOTING';
    case 'DAY_VOTING':     return 'DAY_ELIMINATION';
    case 'DAY_ELIMINATION': return 'NIGHT_START';
    default:               return 'GAME_OVER';
  }
}
