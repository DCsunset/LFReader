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
import { QueryParams, state } from "./state";
import { batch } from "@preact/signals";
import { AlertColor } from "@mui/material";
import { FeedUserData } from "./feed";

export function handleExternalLink(e: MouseEvent) {
  if (state.settings.value.confirmOnExternalLink) {
    // use getAttrbiutes to get the raw href value
    const link = (e.currentTarget as HTMLAnchorElement | null)?.getAttribute("href") || "";
    if (/^\w+:/.test(link) && !confirm(`Confirm to open external link ${link}`)) {
      // Must to preventDefault as return value doesn't work for target=_blank
      e.preventDefault();
    }
  }
}

export function notify(color: AlertColor, text: string) {
  state.notification.value = { color, text };
}

async function notifyRespError(resp: Response) {
  const err = await resp.json();
  notify("error", `${resp.statusText}: ${err.detail}`)

}

async function getData() {
  const responses  =  await Promise.all([
    fetch("/api/feeds"),
    fetch("/api/entries")
  ]);
  for (const resp of responses) {
    if (!resp.ok) {
      notifyRespError(resp);
      return undefined;
    }
  }
  const [feeds, entries] = await Promise.all(responses.map(r => r.json()));
  return { feeds, entries };
}

export async function fetchData(feedUrls?: string[]) {
  const resp =  await fetch("/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      feed_urls: feedUrls,
      archive: state.settings.value.archive,
      force_archive: state.settings.value.forceArchive
    })
  });
  if (!resp.ok) {
    notifyRespError(resp);
    return false;
  }

  const data = await getData();
  if (data) {
    batch(() => {
      state.data.value = data;
      notify("success", "Updated feeds successfully")
    })
    return true;
  }
  return false;
}

export async function loadData() {
  const data = await getData();
  if (data) {
    batch(() => {
      state.data.value = data;
      notify("success", "Loaded feeds successfully")
    });
  }
}

export async function updateFeed(url: string, userData: FeedUserData) {
  // needs double encoding to include slash in url and decode it once at the server
  const resp =  await fetch(`/api/feeds`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      feed_url: url,
      user_data: userData
    })
  });
  if (!resp.ok) {
    notifyRespError(resp);
    return false;
  }

  // update feeds locally for performance
  state.data.value = {
    feeds: state.data.value.feeds.map(f => (
      f.url === url ? {
        ...f,
        user_data: userData
      } : f
    )),
    entries: state.data.value.entries
  };
  notify("success", "Updated feed successfully");
  return true;
}

// update query params
export function updateQueryParams(params: QueryParams, reset: boolean = false) {
  // merge with original params if not resetting
  const newParams = reset ? params : {
    ...state.queryParams.value,
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
  const data = state.data.value;
  batch(() => {
    state.data.value = {
      feeds: data.feeds.filter(f => f.url !== url),
      entries: data.entries.filter(e => e.feed_url !== url)
    };
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

  const data = await getData();
  if (data) {
    batch(() => {
      state.data.value = data;
      notify("success", "Database archived successfully");
    })
    return true;
  }
  return false;
}

