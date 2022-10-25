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

const fetcher = async (url: string, args: any) => {
	const res = await axios.get(url, {
		params: args
	});
	return res.data;
};

// SWR hooks to fetch data
export const useFeeds = (args?: FeedQueryArgs) => (
	useSWR<FeedWithIcon[], Error>(["/api/feeds", args], async (url, args) => {
		const origFeeds = await fetcher(url, args) as Feed[];
		const newFeeds = await Promise.all(
			origFeeds.map(async feed => ({
				...feed,
				icon: feed.link && await fetchIcon(feed.link)
			} as FeedWithIcon))
		);
		return newFeeds;
	})
)

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
