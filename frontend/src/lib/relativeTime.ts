const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const THRESHOLDS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: "second", ms: 1_000 },
  { unit: "minute", ms: 60_000 },
  { unit: "hour", ms: 3_600_000 },
  { unit: "day", ms: 86_400_000 },
  { unit: "week", ms: 604_800_000 },
  { unit: "month", ms: 2_628_000_000 },
  { unit: "year", ms: 31_536_000_000 },
];

export function relativeTime(dateOrIso: Date | string): string {
  const date = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  const diffMs = date.getTime() - Date.now();
  const absDiff = Math.abs(diffMs);

  // For anything under a minute just say "just now"
  if (absDiff < 60_000) return "just now";

  // Find the largest unit that fits
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (absDiff >= THRESHOLDS[i].ms) {
      const value = Math.round(diffMs / THRESHOLDS[i].ms);
      return rtf.format(value, THRESHOLDS[i].unit);
    }
  }

  return "just now";
}
