import { Accessor, createContext, createMemo } from "solid-js"
import { Entry, Feed, filterEntries, filterFeeds, getEntryDate } from "./feed"
import { state } from "./store"
import { Base64 } from "js-base64"
import { DateTime } from "luxon"

export type AppCtx = {
  currentPage: Accessor<number>,
  currentFeed: Accessor<Feed|undefined>,
  currentEntry: Accessor<Entry|undefined>,
  currentEntryContent: Accessor<Entry|undefined>,
  currentEntryFeed: Accessor<Feed|undefined>,
  filteredFeeds: Accessor<Feed[]>,
  filteredEntries: Accessor<Entry[]>,
  displayedEntries: Accessor<Entry[]>,
}

export const Ctx = createContext<AppCtx>()

export type SearchParams = {
  tag?: string,
  feed?: string,
  entry?: string,
  page?: string,
  entryTitle?: string,
}

function regexpFromStr(str?: string) {
  return str ? new RegExp(str) : undefined;
}

export function deriveCtx(searchParams: SearchParams): AppCtx {
  const currentPage = createMemo(() => {
    const pageInt = parseInt(searchParams.page ?? "1");
    return pageInt > 0 ? pageInt : 1;
  })

  const currentFeed = createMemo(() => {
    const feed_id = searchParams.feed
    if (!feed_id) {
      return undefined
    }
    const url = Base64.decode(feed_id)
    return url ? state.data.feedMap.get(url) : undefined
  })

  const currentEntry = createMemo(() => {
    const entryId = searchParams.entry
    if (!entryId) {
      return undefined
    }
    return state.data.entryIdMap.get(entryId)
  })

  const currentEntryContent = createMemo(() => {
    const entryId = searchParams.entry
    if (!entryId) {
      return undefined
    }
    return state.data.entryContents.get(entryId)
  })

  const currentEntryFeed = createMemo(() => {
    const entry = currentEntry()
    return entry?.feed_url ? state.data.feedMap.get(entry.feed_url) : undefined
  })

  const filteredFeeds = createMemo(() => {
    const feed = currentFeed()
    if (feed) {
      return [feed];
    }
    return filterFeeds(state.data.feeds, { tag: searchParams.tag });
  });

  const filteredEntries = createMemo(() => {
    return filterEntries(state.data.entries, {
      feeds: filteredFeeds(),
      titleRegex: regexpFromStr(searchParams.entryTitle),
    })
  })

  const displayedEntries = createMemo(() => {
    const page = currentPage()
    const pageSize = state.settings.pageSize

    return filteredEntries()
      .sort((l, r) => {
        let result
        switch (state.ui.entrySortBy) {
          // @ts-ignore (allow fallthrough)
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
        return result * (state.ui.entrySortDesc ? -1 : 1)
      })
      .slice(
        (page - 1) * pageSize,
        page * pageSize
      )
  })

  return {
    currentPage,
    currentFeed,
    currentEntry,
    currentEntryContent,
    currentEntryFeed,
    filteredFeeds,
    filteredEntries,
    displayedEntries,
  }
}

