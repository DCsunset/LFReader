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

import { computed, effect, Signal, signal } from "@preact/signals";
import { AlertColor } from "@mui/material/Alert";
import { Entry, Feed, FeedUserData, getEntryTitle } from "./feed";
import { loadData } from "./actions";
import { Base64 } from "js-base64";


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
	dark: boolean,
  pageSize: number,
  archive: boolean,
  forceArchive: boolean,
  confirmOnExternalLink: boolean
};

export type QueryParams = {
  feed?: string,
  entry?: string,
  page?: string,
  entryTitleFilter?: string
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

// Use multiple signals to separate change update
// (e.g. Don't clear text immeidately when closing it)
export type FeedDialogState = {
  open: Signal<boolean>,
  feed: Signal<Feed|undefined>,
  // It always changes with feed, so no need to use signal
  onSave?: (feed: Feed, data: FeedUserData) => Promise<boolean>
};

// global app state
export const appState = {
	settings: signal<Settings>(loadState("settings", {
		dark: false,
    pageSize: 20,
    archive: true,
    forceArchive: false,
    confirmOnExternalLink: false
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
  },
  feedDialog: {
    open: signal(false),
    feed: signal(undefined),
  } as FeedDialogState
};

// Map to quickly look up feed or entry by url
const feedMap = computed(
  () => appState.data.value.feeds.reduce(
    (acc, cur) => acc.set(cur.url, cur),
    new Map<string, Feed>()
  )
);
const entryMap = computed(
  () => appState.data.value.entries.reduce(
    (acc, cur) => cur.link ? acc.set(cur.link, cur) : acc,
    new Map<string, Entry>()
  )
);

export function lookupFeed(url?: string) {
  return url && feedMap.value.get(url);
}

export function lookupEntry(url?: string) {
  return url && entryMap.value.get(url);
}

export function fromEntryId(entry_id: string) {
  const [feed_url, id] = JSON.parse(Base64.decode(entry_id));
  return appState.data.value.entries.find(e => e.feed_url === feed_url && e.id === id);
}

export function fromFeedId(feed_id: string) {
  const url = Base64.decode(feed_id);
  return lookupFeed(url);
}


// Get tags from feeds or entries
function getTags(items: any[]) {
  return items
    .map(v => v.user_data?.tags)
    .filter(v => v);
}

// Feeds to show in FeedList
const filteredFeeds = computed(() => {
  const excludedTags = appState.ui.excludedTags.value;
  return appState.data.value.feeds.filter(feed => {
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
  const feed_id  = appState.queryParams.value.feed;
  if (!feed_id) {
    return undefined;
  }
  return fromFeedId(feed_id);
});

// active entry
const selectedEntry = computed(() => {
  const entry_id = appState.queryParams.value.entry;
  if (!entry_id) {
    return undefined;
  }
  return fromEntryId(entry_id);
});

// Feed of selected entry
const selectedEntryFeed = computed(() => {
  const entry = selectedEntry.value;
  return entry && lookupFeed(entry.feed_url);
});

function regexpFromString(str?: string) {
  return str && (str.length > 0 ? new RegExp(str) : undefined);
}

const filteredEntries = computed(() => {
  const entries = appState.data.value.entries;
  const selectedFeedUrl = selectedFeed.value?.url;
  // show entries of filtered feeds
  const urls = selectedFeedUrl ? undefined : new Set(filteredFeeds.value.map(f => f.url));
  const entryTitleRe = regexpFromString(appState.queryParams.value.entryTitleFilter);

  const filters: ((entry: Entry) => boolean)[] = [
    // filter by feeds
    v => (
      selectedFeedUrl
        ? v.feed_url === selectedFeedUrl
        : urls.has(v.feed_url)
    ),
    // filter by entryTitle
    v => !entryTitleRe || entryTitleRe.test(getEntryTitle(v))
  ];

  return entries.filter(v => filters.map(f => f(v)).every(r => r));
});

export const computedState = {
  page: computed(() => {
    const pageInt = parseInt(appState.queryParams.value.page);
    return pageInt > 0 ? pageInt : 1;
  }),
  feedTags: computed(() => getTags(appState.data.value.feeds)),
  entryTags: computed(() => getTags(appState.data.value.entries)),
  selectedFeed,
  selectedEntry,
  selectedEntryFeed,
  filteredFeeds,
  filteredEntries
};

// Persist settings on change
effect(() => {
  localStorage.setItem(appKey("settings"), JSON.stringify(appState.settings.value));
});

// Persist ui states on change
for (const [key, item] of Object.entries(appState.ui)) {
  effect(() => {
    localStorage.setItem(appKey(`ui.${key}`), JSON.stringify(item.value));
  });
}

// Load data on mount
loadData();

