const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/;

function isRealDateOnly(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizeDateOnly(
  value: string | null | undefined,
  label: string,
): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;
  if (!isRealDateOnly(candidate)) throw new Error(`Enter ${label} as YYYY-MM-DD.`);
  return candidate;
}

export function validateDateRange(startDate: string | null, endDate: string | null): void {
  if (startDate && endDate && endDate < startDate) {
    throw new Error('The end date cannot be before the start date.');
  }
}

export function localDateTimeToIso(value: string, label: string): string {
  const candidate = value.trim();
  if (!LOCAL_DATE_TIME_PATTERN.test(candidate)) {
    throw new Error(`Enter ${label} as YYYY-MM-DD HH:MM.`);
  }

  const normalized = candidate.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Enter a valid ${label}.`);
  }

  const [datePart, timePart] = normalized.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    throw new Error(`Enter a valid ${label}.`);
  }

  return parsed.toISOString();
}

function readLocalDateTime(value: string, label: string): {
  date: string;
  time: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const candidate = value.trim();
  if (!LOCAL_DATE_TIME_PATTERN.test(candidate)) {
    throw new Error(`Enter ${label} as YYYY-MM-DD HH:MM.`);
  }
  const [date, time] = candidate.replace(' ', 'T').split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const validation = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    validation.getUTCFullYear() !== year ||
    validation.getUTCMonth() + 1 !== month ||
    validation.getUTCDate() !== day ||
    validation.getUTCHours() !== hour ||
    validation.getUTCMinutes() !== minute
  ) {
    throw new Error(`Enter a valid ${label}.`);
  }
  return { date, time, year, month, day, hour, minute };
}

export function zonedLocalDateTimeToIso(value: string, label: string, timeZone: string): string {
  const parts = readLocalDateTime(value, label);
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const formatted = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(new Date(utcGuess));
  const values = Object.fromEntries(formatted.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
  );
  return new Date(utcGuess - (representedAsUtc - utcGuess)).toISOString();
}

export function optionalZonedLocalDateTimeToIso(
  value: string | null | undefined,
  label: string,
  timeZone: string,
): string | null {
  return value?.trim() ? zonedLocalDateTimeToIso(value, label, timeZone) : null;
}

export function optionalLocalDateTimeToIso(
  value: string | null | undefined,
  label: string,
): string | null {
  const candidate = value?.trim();
  return candidate ? localDateTimeToIso(candidate, label) : null;
}

export function isoToLocalDateTimeInput(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function isoToZonedDateTimeInput(
  value: string | null | undefined,
  timeZone: string,
): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}`;
}

export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
