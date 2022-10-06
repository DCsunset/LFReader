import axios from "axios";
import { Base64 } from "js-base64";

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

function encodeId(url: string) {
	// url-safe encoding (note: without padding)
	return Base64.encode(url, true);
}

export async function getFeeds() {
	const { data } = await axios.get("/feeds");
	return data as Feed[];
}

export async function getFeed(feedUrl: string) {
	const id = encodeId(feedUrl);
	const { data } = await axios.get(`/feeds/${id}`);
	return data as Feed;
}

export async function updateFeed(feedUrl: string) {
	const id = encodeId(feedUrl);
	await axios.put(`/feeds/${id}`);
}

export async function deleteFeed(feedUrl: string) {
	const id = encodeId(feedUrl);
	await axios.delete(`/feeds/${id}`);
}

export async function getEntries() {
	const { data } = await axios.get(`/entries`);
	return data as Entry[];
}
