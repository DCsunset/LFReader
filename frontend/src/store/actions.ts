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

import { route } from "preact-router";
import { QueryParams, appState } from "./state";
import { batch } from "@preact/signals";
import { AlertColor } from "@mui/material";
import { Entry, Feed, FeedUserData, toEntryId } from "./feed";

function apiUrl(rest?: string) {
}

export async function fetchApi(rest?: string, options?: any) {
  const url = `${appState.settings.value.apiBaseUrl}/${rest ?? ""}`;
  try {
    const resp = await fetch(url, options);
    const body = await resp.json()
    if (!resp.ok) {
      notify("error", `${body.statusText}: ${body.detail}`)
      return undefined;
    }
    return body;
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
  appState.status.loading.value = true;
  const maxBackoff = 10000;
  let backoff = 500;
  while (true) {
    await new Promise(r => setTimeout(r, backoff));
    const status = await fetchApi("status");
    if (!status?.loading) {
      appState.status.loading.value = false;
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
  return await fetchApi("entries/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(query)
  });
}

async function getData() {
  const [feeds, entries] = await Promise.all([
    fetchApi("feeds"),
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

export async function fetchData(feeds?: Feed[]) {
  const resp = await fetchApi("", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      feeds,
      archive: appState.settings.value.archive,
      force_archive: appState.settings.value.forceArchive,
      // ignore error when updating all feeds
      ignore_error: !feeds
    })
  });
  if (resp === undefined) {
    return undefined;
  }

  // wait until server finish loading
  await waitForLoading();

  const ok = await getData();
  if (ok) {
    notify("success", "Updated feeds successfully")
  }
  return ok;
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

export async function updateFeed(feed: Feed, userData: FeedUserData) {
  // needs double encoding to include slash in url and decode it once at the server
  const resp =  await fetchApi("feeds", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: feed.url,
      user_data: userData
    })
  });
  if (resp === undefined) {
    return false;
  }

  // update feeds locally for performance
  appState.data.feeds.value = appState.data.feeds.value.map(f => (
    f.url === feed.url ? {
      ...f,
      user_data: userData
    } : f
  ));
  notify("success", "Updated feed successfully");
  return true;
}

// update query params
export function updateQueryParams(params: QueryParams, reset: boolean = false) {
  // merge with original params if not resetting
  const newParams = reset ? params : {
    ...appState.queryParams.value,
    ...params,
  };
  // remove undefined fields
  Object.keys(newParams).forEach(
    k => newParams[k] === undefined && delete newParams[k]
  );
  route(`/?${new URLSearchParams(newParams)}`);
}

/// Delete feed
export async function deleteFeed(url: string) {
  const query = new URLSearchParams({
    feed_urls: url
  });
  const resp = await fetchApi(`?${query}`, { method: "DELETE" });
  if (resp === undefined) {
    return false;
  }

  // Fast deletion in frontend
  const data = appState.data;
  batch(() => {
    data.feeds.value = data.feeds.value.filter(f => f.url !== url);
    data.entries.value = data.entries.value.filter(e => e.feed_url !== url);
    notify("success", "Feed deleted successfully");
  });
  return true;
}

/// Archive entries in database
export async function archiveFeeds(urls?: string[]) {
  const resp =  await fetchApi("", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      operation: "archive",
      feed_urls: urls
    })
  });
  if (resp === undefined) {
    return false;
  }

  // wait until server finish loading
  await waitForLoading();

  const ok = await getData();
  if (ok) {
    notify("success", "Database archived successfully");
  }
  return ok;
}

