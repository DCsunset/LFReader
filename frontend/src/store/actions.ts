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


import { state } from "./state";

function handleError(msg: string) {
  state.notification.value = {
    color: "error",
    text: msg
  };
}

export async function getFeeds() {
  const resp =  await fetch("/api/feeds");
  if (!resp.ok) {
    const text = await resp.text();
    handleError(`${resp.statusText}: ${text}`);
    return;
  }
  state.feeds.value = await resp.json();
}

export async function getEntries() {
  const resp =  await fetch("/api/entries");
  if (!resp.ok) {
    const text = await resp.text();
    handleError(`${resp.statusText}: ${text}`);
    return;
  }
  state.entries.value = await resp.json();
}

export async function fetchData() {
  try {
    await Promise.all([
      getFeeds(),
      getEntries()
    ]);
  } catch (err: any) {
    handleError(`Failed to fetch: ${err.message}`);
  }
}

