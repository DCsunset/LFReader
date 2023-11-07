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

import { computed, effect, signal } from "@preact/signals";
import { AlertColor } from "@mui/material/Alert";

export type Notification = {
	color: AlertColor,
	text: string
};

export type Settings = {
  pageSize: number,
	dark: boolean
};

function merge(value: any, init: any) {
  if (value?.constructor === Object) {
    // normal JSON-like object
    return {
      ...init,
      ...value
    };
  }
  else {
    return value || init;
  }
}

function loadState(key: string, init: any) {
  try {
    const data = localStorage.getItem(key);
    return merge(
      data && JSON.parse(data),
      init
    );
  }
  catch (err: any) {
    console.error(err);
    return init;
  }
}

// global app state
export const state = {
	settings: signal<Settings>(loadState("settings", {
    pageSize: 20,
		dark: false
	})),
  feeds: signal<any[]>([]),
  entries: signal<any[]>([]),
  // query parameters from url
  queryParams: signal<{
    feed_tag?: string,
    feed?: string,
    entry?: string
  }>({}),
  notification: signal<Notification | null>(null),
  confirmation: {
    open: signal(false),
    text: signal(""),
    onConfirm: () => {}
  }
};

// Get tags from feeds or entries
function getTags(items: any[]) {
  return items
    .map(v => v.user_data?.tags)
    .filter(v => v);
}

export const computedState = {
  feedTags: computed(() => getTags(state.feeds.value)),
  entryTags: computed(() => getTags(state.entries.value))
};

// Persist state on change
effect(() => {
  localStorage.setItem("settings", JSON.stringify(state.settings.value));
});

