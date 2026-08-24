import { describe, expect, it } from 'vitest';

import { splitAmountEvenly } from './money';

describe('splitAmountEvenly', () => {
  it('preserves every minor unit when a split has a remainder', () => {
    const shares = splitAmountEvenly(1000, ['drake', 'clay', 'maya']);

    expect(shares).toEqual([
      { participantId: 'drake', amountMinor: 334 },
      { participantId: 'clay', amountMinor: 333 },
      { participantId: 'maya', amountMinor: 333 },
    ]);
    expect(shares.reduce((total, share) => total + share.amountMinor, 0)).toBe(1000);
  });

  it('rejects duplicate or missing participants', () => {
    expect(() => splitAmountEvenly(100, [])).toThrow();
    expect(() => splitAmountEvenly(100, ['drake', 'drake'])).toThrow();
  });
});
