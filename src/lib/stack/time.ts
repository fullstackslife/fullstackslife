const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function when(iso: string): string {
  const date = new Date(iso);
  const day = DAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${date.getUTCDate()} ${month} · ${hours}:${minutes} UTC`;
}

export function dayLabel(date: Date): string {
  return `${DAYS[date.getUTCDay()]} ${date.getUTCDate()}`;
}

export function utcMidnight(offset: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
}

export function slotIso(day: Date, hour: number, minute: number): string {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute)).toISOString();
}
