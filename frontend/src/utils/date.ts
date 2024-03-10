// LFReader
// Copyright (C) 2022-2024  DCsunset

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
