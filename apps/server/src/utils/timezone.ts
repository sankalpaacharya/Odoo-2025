/**
 * Get the current date in Nepal timezone (UTC+5:45)
 * Returns a Date object set to 00:00:00 UTC for the Nepal date
 */
export function getNepalDate(timestamp: Date = new Date()): Date {
  const nepalOffsetMinutes = 5.75 * 60; // 5 hours 45 minutes in minutes
  const localTime = new Date(
    timestamp.getTime() + nepalOffsetMinutes * 60 * 1000
  );

  return new Date(
    Date.UTC(
      localTime.getUTCFullYear(),
      localTime.getUTCMonth(),
      localTime.getUTCDate()
    )
  );
}

/**
 * Convert a timestamp to Nepal timezone
 */
export function toNepalTime(timestamp: Date): Date {
  const nepalOffsetMinutes = 5.75 * 60;
  return new Date(timestamp.getTime() + nepalOffsetMinutes * 60 * 1000);
}
