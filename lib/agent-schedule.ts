import {
  fromZonedTime,
  toZonedTime,
} from "date-fns-tz";

/**
 * Parses time strings in various formats:
 * - "09:00 AM", "9:30 PM", "12:00 pm"
 * - "09:00", "14:30", "09:00:00"
 */
function parseTime(timeStr?: string): { hour: number; minute: number } | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const trimmed = timeStr.trim();
  if (trimmed === "--:-- --" || trimmed === "" || trimmed.includes("--")) return null;

  // Match 12-hour or 24-hour time format with optional AM/PM
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) {
    const parts = trimmed.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        return { hour: Math.min(23, Math.max(0, h)), minute: Math.min(59, Math.max(0, m)) };
      }
    }
    return null;
  }

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (isNaN(hour) || isNaN(minute)) return null;

  if (period === "PM" && hour < 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

export function calculateNextDailyRun({
  time,
  timezone = "UTC",
  after = new Date(),
}: {
  time: string;
  timezone: string;
  after?: Date;
}): Date | null {
  const parsed = parseTime(time);
  if (!parsed) {
    return null;
  }

  const { hour, minute } = parsed;
  const validTz = timezone || "UTC";

  try {
    const baseAfter = after instanceof Date && !isNaN(after.getTime()) ? after : new Date();
    const localAfter = toZonedTime(baseAfter, validTz);
    const localCandidate = new Date(localAfter);

    localCandidate.setHours(hour, minute, 0, 0);

    let candidateUtc = fromZonedTime(localCandidate, validTz);

    // Today's scheduled time has passed -> schedule for tomorrow
    if (candidateUtc <= baseAfter) {
      localCandidate.setDate(localCandidate.getDate() + 1);
      candidateUtc = fromZonedTime(localCandidate, validTz);
    }

    if (!candidateUtc || isNaN(candidateUtc.getTime())) {
      return null;
    }

    return candidateUtc;
  } catch (err) {
    console.warn("Failed to calculate next daily run:", err);
    return null;
  }
}
