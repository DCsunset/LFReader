import axios from "axios";
import useSWR from "swr";
import { Feed, Entry } from "../utils/feed";
import fetchIcon from "../utils/fetchIcon";

export interface FeedUpdateArgs {
	feeds: string[],
	tags?: string[]
}

export interface FeedQueryArgs {
	tags?: boolean | (string | boolean | (string | boolean)[])[],
	feed?: string
}

export interface FeedWithIcon extends Feed {
	icon?: string
};

const fetcher = async (url: string, args?: any) => {
	const res = await axios.get(url, {
		params: args
	});
	return res.data;
};

export const fetchFeeds = async (args?: FeedQueryArgs) => {
	const origFeeds: Feed[] = await fetcher("/api/feeds", args);
	const newFeeds = await Promise.all(
		origFeeds.map(async feed => ({
			...feed,
			icon: feed.link && await fetchIcon(feed.link)
		} as FeedWithIcon))
	);
	return newFeeds;
};

// SWR hook to fetch entries
export const useEntries = (args?: FeedQueryArgs) => (
	useSWR<Entry[], Error>(["/api/entries", args], fetcher)
)

export async function updateFeeds(args: FeedUpdateArgs) {
	await axios.put(`/api/feeds`, args);
}

export async function deleteFeeds(args: FeedUpdateArgs) {
	await axios.delete(`/api/feeds`, {
		params: args
	});
}
