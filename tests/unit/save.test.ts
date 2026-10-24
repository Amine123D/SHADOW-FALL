import { describe, it, expect } from 'vitest';
import { validateSave } from '../../src/systems/SaveSystem';

const valid = {
  version: 1,
  level: 3,
  xp: 10,
  bag: ['rusted_blade'],
  equipped: { weapon: 'ashen_sword', armor: null, trinket: null },
  checkpoint: { x: 450, y: 200 },
};

describe('validateSave', () => {
  it('accepts a valid save', () => {
    const result = validateSave(valid);
    expect(result?.level).toBe(3);
    expect(result?.equipped.weapon).toBe('ashen_sword');
  });

  it('rejects non-objects', () => {
    expect(validateSave(null)).toBeNull();
    expect(validateSave('hello')).toBeNull();
  });

  it('rejects the wrong version', () => {
    expect(validateSave({ ...valid, version: 2 })).toBeNull();
  });

  it('rejects unknown item ids', () => {
    expect(validateSave({ ...valid, bag: ['fake_item'] })).toBeNull();
  });

  it('rejects an item in the wrong slot', () => {
    expect(
      validateSave({ ...valid, equipped: { weapon: 'patchwork_vest', armor: null, trinket: null } })
    ).toBeNull();
  });

  it('rejects broken numbers', () => {
    expect(validateSave({ ...valid, xp: Number.NaN })).toBeNull();
    expect(validateSave({ ...valid, level: 999 })).toBeNull();
  });

  it('rejects a bag that is too big', () => {
    expect(
      validateSave({ ...valid, bag: Array(13).fill('rusted_blade') })
    ).toBeNull();
  });
});