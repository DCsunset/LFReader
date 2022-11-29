import { DateTime } from "luxon";

export function displayDate(isoDate: string) {
	return DateTime.fromISO(isoDate).toLocaleString(DateTime.DATETIME_MED);
}
