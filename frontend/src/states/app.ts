import { atom, AtomEffect } from "recoil";
import { Notification } from "../types/states";
import { Entry, Feed } from "../utils/feed";
import { fetchFeeds } from "./actions";

// Only keeps the latest notification
export const notificationState = atom<Notification | null>({
	key: "notification",
	default: null
});

const initFeedListEffect: AtomEffect<Feed[] | null> = ({ setSelf }) => {
	// asynchronously call setSelf to get rid of Suspense
	const initialize = async () => {
		setSelf(await fetchFeeds());
	};
	initialize();
};

export const feedListState = atom<Feed[] | null>({
	key: "feedList",
	default: null,
	effects: [initFeedListEffect]
});
