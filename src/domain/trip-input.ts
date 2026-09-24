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

export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

