import { Base64 } from "js-base64";

export type Feed = {
  url: string,
  icon?: string,
  title?: string,
  author?: string,
  user_data?: any
};

export type Entry = {
  feed_url: string,
  id: string,
  title?: string,
  summary?: string,
  user_data?: any
};

export function to_feed_id(feed: Feed) {
  return Base64.encode(feed.url, true);
}

export function from_feed_id(feeds: Feed[], feed_id: string) {
  const url = Base64.decode(feed_id);
  return feeds.find(f => f.url === url);
}

export function to_entry_id(entry: Entry) {
  return Base64.encode(`${entry.feed_url} ${entry.id}`, true);
}

export function from_entry_id(entries: Entry[], entry_id: string) {
  const [feed_url, id] = Base64.decode(entry_id).split(" ");
  return entries.find(e => e.feed_url === feed_url && e.id === id);
}

