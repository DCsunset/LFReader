// Copyright (C) 2022-2023  DCsunset

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

export type Feed = {
  url: string,
  link?: string,
  icon?: string,
  title?: string,
  author?: string,
  user_data?: any
};

export type Content = {
  value: string,
  type: string,
  language: string,
  // base URI for links in this content
  base: string
};

export type Entry = {
  feed_url: string,
  id: string,
  link?: string,
  title?: string,
  summary?: Content,
  contents?: Content[],
  user_data?: any
};

export function toFeedId(feed: Feed) {
  return Base64.encode(feed.url, true);
}

export function fromFeedId(feeds: Feed[], feed_id: string) {
  const url = Base64.decode(feed_id);
  return feeds.find(f => f.url === url);
}

export function toEntryId(entry: Entry) {
  return Base64.encode(`${entry.feed_url} ${entry.id}`, true);
}

export function fromEntryId(entries: Entry[], entry_id: string) {
  const [feed_url, id] = Base64.decode(entry_id).split(" ");
  return entries.find(e => e.feed_url === feed_url && e.id === id);
}

