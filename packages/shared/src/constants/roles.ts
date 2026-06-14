export const ROLES = {
  CIVILIAN: {
    id: 'civilian',
    name: { ka: 'მოქალაქე', en: 'Civilian' },
    team: 'town' as const,
    nightAction: false,
    description: { ka: 'პოვე მაფია დისკუსიით და ხმის მიცემით', en: 'Find the Mafia through discussion and voting' }
  },
  MAFIA: {
    id: 'mafia',
    name: { ka: 'მაფია', en: 'Mafia' },
    team: 'mafia' as const,
    nightAction: true,
    description: { ka: 'ღამით ერთი მოქალაქე გაანადგურე', en: 'Eliminate a citizen each night' }
  },
  DETECTIVE: {
    id: 'detective',
    name: { ka: 'დეტექტივი', en: 'Detective' },
    team: 'town' as const,
    nightAction: true,
    description: { ka: 'ღამით შეამოწმე — ერთი მოთამაშე მაფიაა თუ არა', en: 'Check if a player is Mafia each night' }
  },
  DOCTOR: {
    id: 'doctor',
    name: { ka: 'ექიმი', en: 'Doctor' },
    team: 'town' as const,
    nightAction: true,
    description: { ka: 'ღამით დაიცავი ერთი მოთამაშე მკვლელობისგან', en: 'Protect a player from being killed each night' }
  }
} as const;

export type RoleId = keyof typeof ROLES;

export function getRoleDistribution(playerCount: number) {
  if (playerCount <= 6)  return { mafia: 1, detective: 1, doctor: 0, civilian: playerCount - 2 };
  if (playerCount <= 9)  return { mafia: 2, detective: 1, doctor: 1, civilian: playerCount - 4 };
  if (playerCount <= 12) return { mafia: 3, detective: 1, doctor: 1, civilian: playerCount - 5 };
  return {
    mafia: Math.floor(playerCount / 4),
    detective: 1,
    doctor: 1,
    civilian: playerCount - Math.floor(playerCount / 4) - 2
  };
}
