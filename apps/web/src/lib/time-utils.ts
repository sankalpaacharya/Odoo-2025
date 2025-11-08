/**
 * Convert decimal hours to HH:MM format
 * @param hours - Decimal hours (e.g., 9.5, 0.83)
 * @returns Formatted string (e.g., "9h 30m", "0h 50m")
 */
export function formatHoursToTime(hours: number | null | undefined): string {
  if (!hours || hours === 0) return "0h 0m";

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  return `${h}h ${m}m`;
}

/**
 * Convert decimal hours to total minutes
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

/**
 * Convert minutes to HH:MM format
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

/**
 * Format time string to HH:MM (24-hour format)
 */
export function formatTime(timeString: string | null): string {
  if (!timeString) return "-";
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
