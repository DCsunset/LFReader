import { DateTime, DurationObjectUnits } from "luxon";

export function displayDate(isoDate?: string) {
  if (!isoDate) {
    return null;
  }
  const date = DateTime.fromISO(isoDate);
  // already converted to local timezone
  return date.toFormat("yyyy-LL-dd HH:mm");
}

export function displayDateDiff(isoDate?: string) {
  if (!isoDate) {
    return "unknown";
  }
  const date = DateTime.fromISO(isoDate);
	type Unit = keyof DurationObjectUnits;
	const units: Unit[] = ["years", "months", "days", "hours", "minutes", "seconds"];
	const shortUnit = (unit: Unit) => (
    unit === "months" ? "M" : unit.charAt(0)
  );

	const duration = date.diffNow(units);
  	for (const unit of units) {
		const value = duration[unit];
		if (value > 0)
			return "future";
		if (value < 0) {
			if (unit === "seconds") {
        break;
      }
			return `${-value}${shortUnit(unit)}`;
		}
	}

	return "< 1m";
}
