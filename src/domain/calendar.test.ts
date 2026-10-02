import { describe, expect, it } from 'vitest';

import { buildCalendarFile, calendarFileName } from '@/domain/calendar';

describe('calendar export', () => {
  it('creates a portable calendar event and escapes user text', () => {
    const file = buildCalendarFile({
      uid: 'plan-1',
      title: 'Missouri game, fireworks',
      description: 'Section 101\nBring tickets',
      location: 'Columbia; Missouri',
      start: '2026-10-10T20:00:00.000Z',
      end: '2026-10-10T23:00:00.000Z',
    });

    expect(file).toContain('BEGIN:VCALENDAR');
    expect(file).toContain('SUMMARY:Missouri game\\, fireworks');
    expect(file).toContain('DESCRIPTION:Section 101\\nBring tickets');
    expect(file).toContain('LOCATION:Columbia\\; Missouri');
    expect(file).toContain('DTSTART:20261010T200000Z');
  });

  it('uses a safe filename', () => {
    expect(calendarFileName(' Missouri Game! ')).toBe('missouri-game.ics');
  });
});
