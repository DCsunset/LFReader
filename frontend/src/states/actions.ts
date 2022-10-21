import axios from "axios";
import { Feed, Entry } from "../types/feed";

interface FeedUpdateArgs {
	feeds: string[],
	tags?: string[]
}
interface FeedQueryArgs {
	tags?: boolean | (string | boolean | (string | boolean)[])[],
	feed?: string
}

export async function getFeeds(args?: FeedQueryArgs) {
	const { data } = await axios.get("/api/feeds", {
		params: args
	});
	return data as Feed[];
}

export async function updateFeeds(args: FeedUpdateArgs) {
	await axios.put(`/api/feeds`, args);
}

export async function deleteFeeds(args: FeedUpdateArgs) {
	await axios.delete(`/api/feeds`, {
		params: args
	});
}

export async function getEntries(args?: FeedQueryArgs) {
	const { data } = await axios.get(`/api/entries`, {
		params: args
	});
	return data as Entry[];
}
