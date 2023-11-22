import { DateTime } from "luxon";

export function displayDate(isoDate?: string) {
  if (!isoDate) {
    return null;
  }
  const date = DateTime.fromISO(isoDate);
  // already converted to local timezone
  return date.toFormat("yyyy-LL-dd HH:mm");
}
