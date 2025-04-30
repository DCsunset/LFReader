// LFReader
// Copyright (C) 2022-2025  DCsunset
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { createStore, unwrap } from "solid-js/store"
import * as immutable from "immutable"
import { Entry, Feed, getTags, toEntryId } from "./feed"
import { createMemo } from "solid-js";

export type Message = {
	level: "success" | "info" | "warning" | "error",
	text: string
};

export const STORAGE_PREFIX = "lfreader"

function loadStateByKey<T>(key: string, init: T): T {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}.${key}`);
    return {
      ...init,
      ...(data && JSON.parse(data)),
    };
  }
  catch (err: any) {
    console.error(err);
    return init;
  }
}

const INIT_STATE = {
  settings: {
    dark: false,
    pageSize: 20,
    archive: true,
    forceArchive: false,
    confirmOnExternalLink: false,
    reloadInterval: 0,
    playbackRates: null as string[]|null,
  },
  ui: {
    // state of each feed group by tag
    feedGroup: {} as { [tag: string]: boolean },
    entrySortBy: "date" as "date"|"unread",
    entrySortDesc: true,
  },
  status: {
    // Fetching data from origin
    fetching: false,
    editingFeeds: false,
    message: null as Message|null,
  },
  data: {
    feeds: [] as Feed[],
    // Entries without content
    entries: [] as Entry[],
    // Fetch content on demand and cache it
    entryContents: immutable.Map<string, Entry>(),
    // Previous read entry (to mark as read later)
    previousEntry: null as string|null,
  }
}

export const PERSIST_STATE_KEYS: (keyof typeof INIT_STATE)[] = [
  "settings",
  "ui",
]

function loadState(): typeof INIT_STATE {
  const state: any = {}
  for (const key of Object.keys(INIT_STATE)) {
    const k = key as keyof typeof INIT_STATE
    const init = INIT_STATE[k]
    if (PERSIST_STATE_KEYS.includes(k)) {
      state[key] = loadStateByKey(k, init)
    } else {
      state[k] = init
    }
  }
  return state
}


/// State

const [state, origSetState] = createStore(loadState())

// Persiste state
const setState: typeof origSetState = (...args: any[]) => {
  (origSetState as any)(...args)

  if (args.length >= 1 && PERSIST_STATE_KEYS.includes(args[0])) {
    // TODO: debounce
    localStorage.setItem(
      `lfreader.${args[0]}`,
      JSON.stringify(unwrap(state[args[0] as keyof typeof state]))
    )
  }
}

export { state, setState }


/// Derived state

const feedTags = createMemo(() => getTags(state.data.feeds))

// Map to quickly look up feed or entry by url or id
const feedMap = createMemo(() => (
  state.data.feeds.reduce(
    (acc, cur) => acc.set(cur.url, cur),
    new Map<string, Feed>()
  )
))

const entryUrlMap = createMemo(() => (
  state.data.entries.reduce(
    (acc, cur) => cur.link ? acc.set(cur.link, cur) : acc,
    new Map<string, Entry>()
  )
))

const entryIdMap = createMemo(() => (
  state.data.entries.reduce(
    (acc, cur) => cur.link ? acc.set(toEntryId(cur), cur) : acc,
    new Map<string, Entry>()
  )
))

export const derivedState = {
  feedTags,
  feedMap,
  entryUrlMap,
  entryIdMap,
}

