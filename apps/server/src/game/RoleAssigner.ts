import { getRoleDistribution, ROLES } from '@mafia-night/shared';
import type { Player, RoomSettings } from '@mafia-night/shared';

export function assignRoles(players: Player[], settings: RoomSettings): Player[] {
  const dist = getRoleDistribution(players.length);

  const roleList: (keyof typeof ROLES)[] = [];
  for (let i = 0; i < dist.mafia; i++) roleList.push('MAFIA');
  if (settings.roles.detective && dist.detective) roleList.push('DETECTIVE');
  if (settings.roles.doctor && dist.doctor) roleList.push('DOCTOR');
  while (roleList.length < players.length) roleList.push('CIVILIAN');

  // Fisher-Yates shuffle
  for (let i = roleList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roleList[i], roleList[j]] = [roleList[j], roleList[i]];
  }

  return players.map((p, i) => ({ ...p, role: roleList[i] }));
}
