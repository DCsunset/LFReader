/**
 * Feed type definition based on python library `reader`
 */
export interface Feed {
	url: string,
	tags: string[],
	updated?: string,
	title?: string,
	link?: string,
	author?: string,
	subtitle?: string,
	version?: string,
	user_title?: string,
	added: string,
	last_updated?: string,
	updates_enabled: boolean
};

/**
 * Entry type definition based on python library `reader`
 */
export interface Entry {
	/// Used as feed id
	feed_url: string,
	id: string,
	link: string,
	title?: string,
	subtitle?: string,
	author?: string,
	published?: string,
	summary?: string,
	content: Content[],
	read: boolean,
	important: boolean,
	added: string,
	last_updated: string,
	updated?: string,
	updates_enabled: boolean,
	version?: string
};

export interface Content {
	value: string,
	type?: string,
	language?: string
};

/** Get all tags from feeds */
export function getFeedTags(feeds: Feed[]) {
	const tags = feeds.reduce(
		(prev, feed) => {
			feed.tags.forEach(t => prev.add(t));
			return prev;
		},
		new Set<string>()
	)
	// null represents no tag
	return [...tags, null];
}

export function filterFeedsByTag<T extends Feed>(feeds: T[], tag: string | null) {
	return feeds.filter(feed => {
		if (tag === null) {
			// Unsorted
			return feed.tags.length === 0;
		}
		return feed.tags.includes(tag);
	});
}
