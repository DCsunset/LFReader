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

async function notifyRespError(resp: Response) {
  const err = await resp.json();
  notify("error", `${resp.statusText}: ${err.detail}`)
}

async function getStatus() {
  const resp = await fetch("/api/status");
  if (!resp.ok) {
    notifyRespError(resp);
    return null;
  }
  return resp.json();
}

async function waitForLoading() {
  appState.status.loading.value = true;
  const maxBackoff = 10000;
  let backoff = 500;
  while (true) {
    await new Promise(r => setTimeout(r, backoff));
    const status = await getStatus();
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
  return await fetch("/api/entries/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(query)
  });
}

async function getData() {
  const responses = await Promise.all([
    fetch("/api/feeds"),
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
  for (const resp of responses) {
    if (!resp.ok) {
      notifyRespError(resp);
      return false;
    }
  }
  const [feeds, entries] = await Promise.all(responses.map(r => r.json()));
  batch(() => {
    appState.data.feeds.value = feeds;
    appState.data.entries.value = entries;
    // clear cached entry contents
    appState.data.entryContents.value = new Map();
  })
  return true;
}

export async function fetchData(feeds?: Feed[]) {
  const resp = await fetch("/api/", {
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
  if (!resp.ok) {
    notifyRespError(resp);
    return false;
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

  const resp = await queryEntries({ entries: absentEntries });
  if (!resp.ok) {
    notifyRespError(resp);
    return;
  }

  const contents: Entry[] = await resp.json();
  appState.data.entryContents.value = new Map([
    ...entryContents.entries(),
    ...contents.map(e => [toEntryId(e), e] as [string, Entry])
  ]);
}

export async function updateFeed(feed: Feed, userData: FeedUserData) {
  // needs double encoding to include slash in url and decode it once at the server
  const resp =  await fetch(`/api/feeds`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: feed.url,
      user_data: userData
    })
  });
  if (!resp.ok) {
    notifyRespError(resp);
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
  const resp = await fetch(`/api/?${query}`, { method: "DELETE" });
  if (!resp.ok) {
    notifyRespError(resp);
    return;
  }

  // Fast deletion in frontend
  const data = appState.data;
  batch(() => {
    data.feeds.value = data.feeds.value.filter(f => f.url !== url);
    data.entries.value = data.entries.value.filter(e => e.feed_url !== url);
    notify("success", "Feed deleted successfully");
  });
}

/// Archive entries in database
export async function archiveFeeds(urls?: string[]) {
  const resp =  await fetch(`/api/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      operation: "archive",
      feed_urls: urls
    })
  });
  if (!resp.ok) {
    notifyRespError(resp);
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

