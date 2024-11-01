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

import { Base64 } from "js-base64";

export type FeedUserData = {
  alias?: string,
  base_url?: string,
  after_date?: string,
  archive_blacklist?: string,
  archive_sequential?: boolean,
  archive_interval?: number,
  tags?: string[]
};

export type Feed = {
  url: string,
  link?: string,
  icon?: string,
  title?: string,
  author?: string,
  updated_at?: string,
  user_data: FeedUserData
}

export type Content = {
  value: string,
  type: string,
  language: string,
  // base URI for links in this content
  base: string
};

export type Enclosure = {
  href: string,
  type: string,
  length: number,
};

export type EntryServerData = {
  fetched_at: string,
  added_at: string,
};

export type Entry = {
  feed_url: string,
  id: string,
  author?: string,
  link?: string,
  title?: string,
  updated_at?: string,
  published_at?: string,
  user_data: any,
  server_data: EntryServerData,
  summary?: Content,
  contents?: Content[],
  enclosures?: Enclosure[],
};

export function toFeedId(feed: Feed) {
  return Base64.encode(feed.url, true);
}

export function toEntryId(entry: Entry) {
  return Base64.encode(JSON.stringify([entry.feed_url, entry.id]), true);
}

export function getEntryTitle(entry?: Entry, fallback: string = "(No Title)") {
  return entry?.title || fallback;
}

export function getFeedTitle(feed?: Feed, fallback: string = "(No Title)") {
  return feed?.user_data.alias || feed?.title || fallback;
}

