import type { Player } from '@mafia-night/shared';

export function checkWinCondition(players: Player[]): 'town' | 'mafia' | null {
  const alive = players.filter(p => p.isAlive);
  const aliveMafia = alive.filter(p => p.role === 'MAFIA').length;
  const aliveTown = alive.filter(p => p.role !== 'MAFIA').length;

  if (aliveMafia === 0) return 'town';
  if (aliveMafia >= aliveTown) return 'mafia';
  return null;
}
