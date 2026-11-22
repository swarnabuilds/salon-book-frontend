// Services store their duration as a number of minutes, but older records may
// still hold text such as "45 mins". This keeps every screen consistent.
export function formatServiceDuration(
  duration?: string | number | null
): string {
  if (duration === undefined || duration === null || duration === "") {
    return "Not specified";
  }

  const value = Number(duration);

  if (Number.isFinite(value) && value > 0) {
    return `${value} min`;
  }

  return String(duration);
}
