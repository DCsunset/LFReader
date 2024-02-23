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
import { Entry, Feed, fromEntryId, fromFeedId } from "./feed";
import { loadData } from "./actions";
import { FunctionComponent } from "preact";

// prefix for storage to avoid conflicts with other apps at same url
const APP_PREFIX = "lfreader";
function appKey(key: string) {
  return `${APP_PREFIX}.${key}`;
}

export type Notification = {
	color: AlertColor,
	text: string
};

export type Settings = {
  pageSize: number,
	dark: boolean
};

export type QueryParams = {
  feed?: string,
  entry?: string,
  page?: string
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
    const data = localStorage.getItem(appKey(key));
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
  ui: {
    excludedTags: signal([] as string[]),
    editingFeeds: signal(false)
  },
  data: signal({
    feeds: [] as Feed[],
    entries: [] as Entry[]
  }),
  // query parameters from url
  queryParams: signal<QueryParams>({}),
  notification: signal<Notification | null>(null),
  confirmation: {
    open: signal(false),
    content: signal<Element|string>(""),
    onConfirm: () => {}
  }
};

// Get tags from feeds or entries
function getTags(items: any[]) {
  return items
    .map(v => v.user_data?.tags)
    .filter(v => v);
}

// Feeds to show in FeedList
const filteredFeeds = computed(() => {
  const excludedTags = state.ui.excludedTags.value;
  return state.data.value.feeds.filter(feed => {
    for (const t of feed.user_data?.tags ?? []) {
      if (excludedTags.includes(t)) {
        return false;
      }
    }
    return true;
  });
});

// active feed
const selectedFeed = computed(() => {
  const feed_id  = state.queryParams.value.feed;
  if (!feed_id) {
    return undefined;
  }
  return fromFeedId(state.data.value.feeds, feed_id);
});

// active entry
const selectedEntry = computed(() => {
  const entry_id = state.queryParams.value.entry;
  if (!entry_id) {
    return undefined;
  }
  return fromEntryId(state.data.value.entries, entry_id);
});

// Feed of selected entry
const selectedEntryFeed = computed(() => {
  const entry = selectedEntry.value;
  return entry && state.data.value.feeds.find(f => f.url === entry.feed_url);
});

const filteredEntries = computed(() => {
  const entries = state.data.value.entries;
  const selectedUrl = selectedFeed.value?.url;
  if (selectedUrl) {
    return entries.filter(v => v.feed_url === selectedUrl);
  }
  else {
    // show entries of filtered feeds
    const urls = new Set(filteredFeeds.value.map(f => f.url));
    return entries.filter(v => urls.has(v.feed_url));
  }
});

export const computedState = {
  page: computed(() => {
    const pageInt = parseInt(state.queryParams.value.page);
    return pageInt > 0 ? pageInt : 1;
  }),
  feedTags: computed(() => getTags(state.data.value.feeds)),
  entryTags: computed(() => getTags(state.data.value.entries)),
  selectedFeed,
  selectedEntry,
  selectedEntryFeed,
  filteredFeeds,
  filteredEntries
};

// Persist settings on change
effect(() => {
  localStorage.setItem(appKey("settings"), JSON.stringify(state.settings.value));
});

// Persist ui states on change
for (const [key, item] of Object.entries(state.ui)) {
  effect(() => {
    localStorage.setItem(appKey(`ui.${key}`), JSON.stringify(item.value));
  });
}

// Load data on mount
loadData();

