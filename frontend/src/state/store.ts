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

import { createStore } from "solid-js/store"
import * as immutable from "immutable"
import { Entry, Feed, getTags, toEntryId } from "./feed"

export type Message = {
	level: "success" | "info" | "warning" | "error",
	text: string
};

export const [state, setState] = createStore({
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

    get feedTags() {
      return getTags(state.data.feeds)
    },

    // Map to quickly look up feed or entry by url or id
    get feedMap() {
      return this.feeds.reduce(
        (acc, cur) => acc.set(cur.url, cur),
        new Map<string, Feed>()
      )
    },
    get entryUrlMap() {
      return this.entries.reduce(
        (acc, cur) => cur.link ? acc.set(cur.link, cur) : acc,
        new Map<string, Entry>()
      )
    },
    get entryIdMap() {
      return this.entries.reduce(
        (acc, cur) => cur.link ? acc.set(toEntryId(cur), cur) : acc,
        new Map<string, Entry>()
      )
    },
  }
})

