import axios from "axios";
import { Base64 } from "js-base64";
import { Feed, Entry } from "../types/feed";

interface FeedUpdateArgs {
	tags?: string[]
}
interface FeedQueryArgs {
	tags?: boolean | (string | boolean | (string | boolean)[])[],
	feed?: string
}

function encodeId(url: string) {
	// url-safe encoding (note: without padding)
	return Base64.encode(url, true);
}

export async function getFeeds(args?: FeedQueryArgs) {
	const { data } = await axios.get("/api/feeds", {
		params: args
	});
	return data as Feed[];
}

export async function getFeed(feedUrl: string) {
	const id = encodeId(feedUrl);
	const { data } = await axios.get(`/api/feeds/${id}`);
	return data as Feed;
}

export async function updateFeed(feedUrl: string) {
	const id = encodeId(feedUrl);
	await axios.put(`/api/feeds/${id}`);
}

export async function deleteFeed(feedUrl: string) {
	const id = encodeId(feedUrl);
	await axios.delete(`/api/feeds/${id}`);
}

export async function getEntries(args?: FeedQueryArgs) {
	const { data } = await axios.get(`/api/entries`, {
		params: args
	});
	return data as Entry[];
}
