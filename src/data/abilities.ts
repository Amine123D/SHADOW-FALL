export type AbilityId = 'rush' | 'quake' | 'stance';

export interface AbilityDef {
  id: AbilityId;
  name: string;
  keyLabel: string;
  cooldownMs: number;
  damageMultiplier: number;
}

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  rush: {
    id: 'rush',
    name: 'Forward Rush',
    keyLabel: 'A',
    cooldownMs: 3000,
    damageMultiplier: 1.3,
  },
  quake: {
    id: 'quake',
    name: 'Ground Shockwave',
    keyLabel: 'S',
    cooldownMs: 5000,
    damageMultiplier: 1.6,
  },
  stance: {
    id: 'stance',
    name: 'Defensive Stance',
    keyLabel: 'D',
    cooldownMs: 7000,
    damageMultiplier: 0,
  },
};

export const ABILITY_TUNING = {
  rush: { durationMs: 180, speed: 330, hitWidth: 22 },
  quake: { windupMs: 150, activeMs: 150, recoveryMs: 150, halfWidth: 48, height: 26 },
  stance: { durationMs: 1500, damageTakenMultiplier: 0.4 },
};