// LFReader
// Copyright (C) 2022-2025  DCsunset

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
import { Entry, Feed, filterEntries, filterFeeds, getEntryDate, toEntryId } from "./feed";
import { checkUpdate, FeedInfo, loadData, loadEntryContents } from "./actions";
import { Base64 } from "js-base64";
import * as immutable from "immutable";
import { DateTime } from "luxon";


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
  confirmOnExternalLink: boolean,
  playbackRates?: string[],
  reloadInterval: number,
};

export type QueryParams = {
  tag?: string,
  feed?: string,
  entry?: string,
  page?: string,
  entryTitleFilter?: string
};

function attrByPath(obj: any, path: string) {
  return path.split(".").reduce((v, key) => v?.[key], obj);
}

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

function loadState<T>(key: string, init: T): T {
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
  onSave?: (feed: FeedInfo) => Promise<boolean>
};

// global app state
export const appState = {
	settings: signal<Settings>(loadState("settings", {
		dark: false,
    pageSize: 20,
    archive: true,
    forceArchive: false,
    confirmOnExternalLink: false,
    reloadInterval: 0,
	})),
  state: {
    // state of each feed group by tag
    feedGroup: signal(loadState("state.feedGroup", {} as { [tag: string]: boolean })),
    entrySortBy: signal(loadState("state.entrySortBy", "date" as "date"|"unread")),
    entrySortDesc: signal(loadState("state.entrySortDesc", true)),
  },
  ui: {
    loading: signal(false),
    smallDevice: signal(false),
    editingFeeds: signal(false),
  },
  data: {
    feeds: signal([] as Feed[]),
    // Entries without content
    entries: signal([] as Entry[]),
    // Fetch content on demand and cache it
    entryContents: signal(immutable.Map<string, Entry>()),
    // Previous read entry (to mark as read later)
    previousEntry: signal<string|null>(null),
  },
  // query parameters from url
  queryParams: signal<QueryParams>({}),
  notification: signal<Notification|null>(null),
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
  () => appState.data.feeds.value.reduce(
    (acc, cur) => acc.set(cur.url, cur),
    new Map<string, Feed>()
  )
);
const entryUrlMap = computed(
  () => appState.data.entries.value.reduce(
    (acc, cur) => cur.link ? acc.set(cur.link, cur) : acc,
    new Map<string, Entry>()
  )
);

const entryIdMap = computed(
  () => appState.data.entries.value.reduce(
    (acc, cur) => cur.link ? acc.set(toEntryId(cur), cur) : acc,
    new Map<string, Entry>()
  )
);

export function lookupFeed(url?: string) {
  return url ? feedMap.value.get(url) : undefined;
}

export function lookupEntryUrl(url?: string) {
  return url ? entryUrlMap.value.get(url) : undefined;
}

export function fromEntryId(entryId: string) {
  return entryIdMap.value.get(entryId);
}

export function fromFeedId(feed_id: string) {
  const url = Base64.decode(feed_id);
  return lookupFeed(url);
}


// Get tags from feeds or entries
function getTags(items: any[]) {
  const tagSet = new Set<string>();
  items.forEach(v => v.user_data?.tags?.forEach((t: string) => tagSet.add(t)));
  return [...tagSet];
}

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

const selectedEntryContent = computed(() => {
  const entryId = appState.queryParams.value.entry
  if (!entryId) {
    return undefined
  }
  return appState.data.entryContents.value.get(entryId)
});

const selectedEntryId = computed(() => {
  const e = selectedEntry.value;
  return e && toEntryId(e);
});

// Feed of selected entry
const selectedEntryFeed = computed(() => {
  const entry = selectedEntry.value;
  return entry && lookupFeed(entry.feed_url);
});

function regexpFromString(str?: string) {
  return str ? new RegExp(str) : undefined;
}

const filteredFeeds = computed(() => {
  const params = appState.queryParams.value;
  const selected = selectedFeed.value
  if (selected) {
    return [selected];
  }
  return filterFeeds(appState.data.feeds.value, { tag: params.tag });
});

const filteredEntries = computed(() => {
  return filterEntries(appState.data.entries.value, {
    feeds: filteredFeeds.value,
    titleRegex: regexpFromString(appState.queryParams.value.entryTitleFilter)
  });
});

const currentPage = computed(() => {
  const pageInt = parseInt(appState.queryParams.value.page ?? "1");
  return pageInt > 0 ? pageInt : 1;
});

const displayedEntries = computed(() => {
  const page = currentPage.value
  const pageSize = appState.settings.value.pageSize
  const sortBy = appState.state.entrySortBy.value
  const sortDesc = appState.state.entrySortDesc.value

  return filteredEntries.value
    .sort((l, r) => {
      let result
      switch (sortBy) {
        case "unread":
          const lRead = l.user_data.read ? 0 : 1
          const rRead = r.user_data.read ? 0 : 1
          if (lRead !== rRead) {
            result = lRead - rRead
            break
          }
        case "date":
        default:
          const lDate = DateTime.fromISO(getEntryDate(l)!).toUnixInteger()
          const rDate = DateTime.fromISO(getEntryDate(r)!).toUnixInteger()
          result = lDate - rDate
          break
      }
      return result * (sortDesc ? -1 : 1)
    })
    .slice(
      (page - 1) * pageSize,
      page * pageSize
    )
})

export const computedState = {
  currentPage,
  feedTags: computed(() => getTags(appState.data.feeds.value)),
  entryTags: computed(() => getTags(appState.data.entries.value)),
  selectedFeed,
  selectedEntry,
  selectedEntryContent,
  selectedEntryFeed,
  selectedEntryId,
  filterFeeds,
  filteredEntries,
  displayedEntries,
};


// Persist state on change
function saveState(path: string) {
  effect(() => {
    localStorage.setItem(
      appKey(path),
      JSON.stringify(attrByPath(appState, path).value)
    );
  });
}

saveState("settings")
for (const state of Object.keys(appState.state)) {
  saveState(`state.${state}`)
}

// Fetch content on page change
effect(() => {
  let entries = displayedEntries.value;
  if (selectedEntry.value) {
    entries = entries.concat(selectedEntry.value);
  }
  loadEntryContents(entries);
});

// Load data on mount
loadData();

// Long polling for keep client cache up to date
effect(() => {
  let interval = appState.settings.value.reloadInterval
  if (interval > 0) {
    let id = setInterval(checkUpdate, interval * 1000)
    return () => clearInterval(id)
  }
})

