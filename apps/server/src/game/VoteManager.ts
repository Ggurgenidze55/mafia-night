import type { Player } from '@mafia-night/shared';

export function countVotes(votes: Record<string, string>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    counts[targetId] = (counts[targetId] || 0) + 1;
  }
  return counts;
}

export function getEliminationTarget(votes: Record<string, string>, alivePlayers: Player[]): string | null {
  const counts = countVotes(votes);
  const aliveIds = new Set(alivePlayers.map(p => p.id));

  let maxVotes = 0;
  let target: string | null = null;
  let tie = false;

  for (const [playerId, count] of Object.entries(counts)) {
    if (!aliveIds.has(playerId)) continue;
    if (count > maxVotes) {
      maxVotes = count;
      target = playerId;
      tie = false;
    } else if (count === maxVotes) {
      tie = true;
    }
  }

  return tie ? null : target;
}
