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

import { route } from "preact-router";
import { QueryParams, appState } from "./state";
import { batch } from "@preact/signals";
import { AlertColor } from "@mui/material";
import { Entry, Feed, FeedUserData, toEntryId } from "./feed";
import { Base64 } from "js-base64";

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
  if (appState.settings.value.confirmOnExternalLink) {
    // use getAttribute to get the raw href value
    const link = (e.currentTarget as HTMLAnchorElement | null)?.getAttribute("href") || "";
    if (/^\w+:/.test(link) && !confirm(`Confirm to open external link ${link}`)) {
      // Must to preventDefault as return value doesn't work for target=_blank
      e.preventDefault();
    }
  }
}

export function notify(color: AlertColor, text: string) {
  appState.notification.value = { color, text };
}

async function waitForLoading() {
  const maxBackoff = 10000;
  let backoff = 500;
  while (true) {
    await new Promise(r => setTimeout(r, backoff));
    const status = await fetchApi("/status");
    if (!status?.loading) {
      break;
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

  batch(() => {
    appState.data.feeds.value = feeds;
    appState.data.entries.value = entries;
    // clear cached entry contents
    appState.data.entryContents.value = new Map();
  })
  return true;
}

export async function loadData() {
  const ok = await getData();
  if (ok) {
    notify("success", "Loaded feeds successfully")
  }
}

export async function loadEntryContents(entries: Entry[]) {
  // prevent depending on itself
  const entryContents = appState.data.entryContents.peek();
  const absentEntries = entries
    .filter(e => !entryContents.has(toEntryId(e)))
    .map(e => ({
      feed_url: e.feed_url,
      id: e.id
    }));
  if (absentEntries.length === 0) {
    return;
  }

  const contents: Entry[] = await queryEntries({ entries: absentEntries });
  if (contents === undefined) {
    return;
  }

  appState.data.entryContents.value = new Map([
    ...entryContents.entries(),
    ...contents.map(e => [toEntryId(e), e] as [string, Entry])
  ]);
}

function encodeQueryItem(item?: string) {
  return item && Base64.encode(item, true);
}

function decodeQueryItem(item: string) {
  return Base64.isValid(item) ? Base64.decode(item) : undefined;
}

// update query params
export function updateQueryParams(params: QueryParams, reset: boolean = false) {
  // merge with original params if not resetting
  const newParams = reset ? params : {
    ...appState.queryParams.value,
    ...params,
  };
  // Encode items
  newParams.tag = encodeQueryItem(newParams.tag);

  // remove undefined fields
  for (const key of Object.keys(newParams)) {
    const k = key as keyof QueryParams;
    if (newParams[k] === undefined) {
      delete newParams[k];
    }
  }
  route(`/?${new URLSearchParams(newParams)}`);
}

// Decode some fields from raw query params
export function parseRawQueryParams(params: any): QueryParams {
  return {
    ...params,
    // Decode items
    tag: decodeQueryItem(params.tag)
  };
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

const asyncActions = new Set([ "fetch", "archive" ]);

export async function dispatchFeedAction(args: FeedActionArgs) {
  appState.status.loading.value = true;

  const resp =  await fetchApi("/feeds", {
    method: "POST",
    body: JSON.stringify(args)
  });
  if (resp === undefined) {
    return false;
  }

  // wait until server finish loading
  if (asyncActions.has(args.action)) {
    await waitForLoading();
  }

  const ok = await getData();
  if (ok) {
    notify("success", `Action ${args.action} finished successfully`);
  }

  appState.status.loading.value = false;
  return ok;
}

