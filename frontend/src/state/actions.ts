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

import { Message, setState, state } from "./store";
import { Entry, EntryUserData, FeedUserData, toEntryId } from "./feed";
import * as immutable from "immutable"

export function notify(level: Message["level"], text: Message["text"]) {
  setState("status", "message", { level, text })
}

export async function fetchApi(url: string, options?: any) {
  try {
    const resp = await fetch(`/api/${url}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options
    });
    if (!resp.ok) {
      notify("error", `${resp.status} ${resp.statusText} ${await resp.text()}`);
      return undefined;
    }
    return await resp.json()
  }
  catch (err: any) {
    notify("error", err.message);
    return undefined;
  }
}

export function handleExternalLink(e: MouseEvent) {
  if (state.settings.confirmOnExternalLink) {
    // use getAttribute to get the raw href value
    const link = (e.currentTarget as HTMLAnchorElement | null)?.getAttribute("href") || "";
    if (/^\w+:/.test(link) && !confirm(`Confirm to open external link ${link}`)) {
      // Must to preventDefault as return value doesn't work for target=_blank
      e.preventDefault();
    }
  }
}

type ServerStatus = {
  loading: boolean,
  updated: string,
};

let lastUpdated: string|null = null
let updating = false;
export async function checkUpdate() {
  // Only allow one ongoing update
  if (updating) {
    return true
  }
  updating = true
  const status: ServerStatus = await fetchApi("status")
  if (status === undefined) {
    updating = false
    return false
  }

  let ok = true
  if (lastUpdated !== status.updated) {
    ok = await getData()
    if (ok) {
      lastUpdated = status.updated
    }
  }

  if (state.status.fetching !== status.loading) {
    setState("status", "fetching", status.loading)
  }
  updating = false
  return ok
}

async function waitForFetching() {
  const maxBackoff = 10000
  let backoff = 500
  while (true) {
    await new Promise(r => setTimeout(r, backoff))
    const ok = await checkUpdate()
    if (!ok) {
      return false
    }
    if (!state.status.fetching) {
      return true
    }
    backoff = Math.min(maxBackoff, backoff * 2);
  }
}

async function queryEntries(query: {
  feed_urls?: string[],
  entries?: Array<{ feed_url: string, id: string }>,
  columns?: string[]
}) {
  return await fetchApi("/entries/query", {
    method: "POST",
    body: JSON.stringify(query)
  });
}

async function getData() {
  const [feeds, entries] = await Promise.all([
    fetchApi("/feeds"),
    // Only get entries without content for efficiency
    queryEntries({
      columns: [
        "feed_url",
        "id",
        "link",
        "author",
        "title",
        "published_at",
        "updated_at",
        "server_data",
        "user_data"
      ]
    })
  ]);
  if (feeds === undefined || entries == undefined) {
    return false;
  }

  setState("data", {
    feeds,
    entries,
    entryContents: immutable.Map(),
  })
  return true;
}

export async function loadData() {
  const ok = await getData();
  if (ok) {
    notify("success", "Loaded feeds successfully")
  }
  return ok;
}

export async function loadEntryContents(entries: Entry[]) {
  // prevent depending on itself
  const absentEntries = entries
    .filter(e => !state.data.entryContents.has(toEntryId(e)))
    .map(e => ({
      feed_url: e.feed_url,
      id: e.id
    }));
  if (absentEntries.length === 0) {
    return;
  }

  // only load content
  const contents: Entry[] = await queryEntries({
    entries: absentEntries,
    columns: [
      "feed_url",
      "id",
      "summary",
      "contents"
    ]
  });
  if (contents === undefined) {
    return;
  }

  setState("data", "entryContents", immutable.Map([
    ...state.data.entryContents.entries(),
    ...contents.map(e => [toEntryId(e), e] as [string, Entry])
  ]))
}


/// Feed Action API

export type FeedInfo = {
  url: string,
  user_data: FeedUserData
}

type FetchFeedsArgs = {
  action: "fetch",
  // specific feed URLs
  feeds?: FeedInfo[],
  // whether to archive resources
  archive?: boolean,
  // whether to force archiving even if content doesn't change
  force_archive?: boolean,
  ignore_error?: boolean
}

type ArchiveFeedsArgs = {
  action: "archive",
  feed_urls?: string[]
}

type CleanFeedsArgs = {
  action: "clean",
  feed_urls?: string[]
}

type DeleteFeedsArgs = {
  action: "delete",
  feed_urls: string[]
}

type UpdateFeedsArgs = {
  action: "update",
  feeds: FeedInfo[]
}

type FeedActionArgs = FetchFeedsArgs | ArchiveFeedsArgs | CleanFeedsArgs | DeleteFeedsArgs | UpdateFeedsArgs;

const asyncFeedActions = new Set([ "fetch", "archive" ]);

export async function dispatchFeedAction(args: FeedActionArgs) {
  setState("status", "fetching", true)
  const resp =  await fetchApi("/feeds", {
    method: "POST",
    body: JSON.stringify(args)
  })
  if (resp === undefined) {
    setState("status", "fetching", false)
    return false
  }

  let ok
  if (asyncFeedActions.has(args.action)) {
    ok = await waitForFetching()
  }
  else {
    setState("status", "fetching", false)
    ok = await getData();
  }

  if (ok) {
    notify("success", `Feed action ${args.action} finished successfully`)
  }
  return ok
}


/// Entry Action API

export type EntryInfo = {
  feed_url: string,
  entry_id: string,
  user_data: EntryUserData,
}

type UpdateEntriesArgs = {
  action: "update",
  entries: EntryInfo[],
}

type EntryActionArgs = UpdateEntriesArgs

export async function dispatchEntryAction(args: EntryActionArgs) {
  const resp =  await fetchApi("/entries", {
    method: "POST",
    body: JSON.stringify(args)
  })
  if (resp === undefined) {
    return false
  }

  // No need for notification on success
  // Updates can be done locally without re-fetching data
  return true
}

export async function fetchFeeds() {
  const { archive, forceArchive } = state.settings;
  await dispatchFeedAction({
    action: "fetch",
    archive,
    force_archive: forceArchive,
    // ignore error when updating all feeds
    ignore_error: true
  })
}

