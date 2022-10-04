import axios from "axios";

export interface Feed {
	url: string,
	link?: string,
	title?: string,
	subtitle?: string,
	added: string,
	last_updated?: string,
	updated?: string,
	updates_enabled: boolean,
	version?: string
};

export interface Content {
	value: string,
	type?: string,
	language?: string
};

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

export async function getFeeds() {
	const { data } = await axios.get("/feeds");
	return data as Feed[];
}

export async function getFeed(feedId: string) {
	const { data } = await axios.get(`/feeds/${feedId}`);
	return data as Feed;
}

export async function updateFeed(feedId: string) {
	await axios.put(`/feeds/${feedId}`);
}

export async function deleteFeed(feedId: string) {
	await axios.delete(`/feeds/${feedId}`);
}

export async function getEntries() {
	const { data } = await axios.get(`/entries`);
	return data as Entry[];
}
