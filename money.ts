export type MoneyShare = {
  participantId: string;
  amountMinor: number;
};

/**
 * Splits an integer amount without floating-point math. Any remainder is assigned
 * one minor unit at a time in participant order so the shares always reconcile.
 */
export function splitAmountEvenly(amountMinor: number, participantIds: string[]): MoneyShare[] {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error('Amount must be a non-negative integer in minor currency units.');
  }
  if (participantIds.length === 0 || new Set(participantIds).size !== participantIds.length) {
    throw new Error('At least one unique participant is required.');
  }

  const baseShare = Math.floor(amountMinor / participantIds.length);
  const remainder = amountMinor % participantIds.length;

  return participantIds.map((participantId, index) => ({
    participantId,
    amountMinor: baseShare + (index < remainder ? 1 : 0),
  }));
}
