/**
 * Feed type definition based on python library `reader`
 */
export type Feed = {
	url: string,
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
export type Entry = {
	id: string,
	updated?: string,
	title?: string,
	link?: string,
	author?: string,
	published?: string,
	summary?: string,
	read: boolean,
	read_modified?: string,
	important: boolean,
	important_modified?: string,
	added: string,
	added_by: "feed" | "user",
	last_updated: string,
	original_feed_url: string,
};
