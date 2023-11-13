import { Base64 } from "js-base64";

export type Feed = {
  url: string,
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

