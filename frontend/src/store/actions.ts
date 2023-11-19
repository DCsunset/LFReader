// Copyright (C) 2022-2023  DCsunset

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

import { route } from "preact-router";
import { QueryParams, state } from "./state";
import { batch } from "@preact/signals";
import { AlertColor } from "@mui/material";

export function notify(color: AlertColor, text: string) {
  state.notification.value = { color, text };
}

export async function updateData(feedUrls?: string[]) {
  const resp =  await fetch("/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ feed_urls: feedUrls })
  });
  if (!resp.ok) {
    const text = await resp.text();
    notify("error", `${resp.statusText}: ${text}`)
    return false;
  }
  const data = await resp.json();
  batch(() => {
    state.data.value = data;
    notify("success", "Updated feeds successfully")
  })
  return true;
}

export async function fetchData() {
  const responses  =  await Promise.all([
    fetch("/api/feeds"),
    fetch("/api/entries")
  ]);
  for (const resp of responses) {
    if (!resp.ok) {
      const text = await resp.text();
      notify("error", `${resp.statusText}: ${text}`)
      return;
    }
  }
  const [feeds, entries] = await Promise.all(responses.map(r => r.json()));
  batch(() => {
    state.data.value = { feeds, entries };
    notify("success", "Loaded feeds successfully")
  })
}

// update query params
export function updateQueryParams(params: QueryParams, reset: boolean = false) {
  // merge with original params if not resetting
  const newParams = reset ? params : {
    ...state.queryParams.value,
    ...params,
  };
  // remove undefined fields
  Object.keys(newParams).forEach(
    k => newParams[k] === undefined && delete newParams[k]
  );
  route(`/?${new URLSearchParams(newParams)}`);
}

