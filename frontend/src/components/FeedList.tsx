import { Box, List, ListItem } from "@mui/material";
import { useEffect, useState } from "react";
import { getFeeds, Feed } from "../states/actions";
import fetchIcon from "../utils/fetchIcon";

export interface FeedWithIcon extends Feed {
	icon?: string
};

function FeedList() {
	const [feeds, setFeeds] = useState<FeedWithIcon[]>([]);

	useEffect(() => {
		const fetchFeeds = async () => {
			const origFeeds= await getFeeds();
			const newFeeds = await Promise.all(
				origFeeds.map(async feed => ({
					...feed,
					icon: feed.link && await fetchIcon(feed.link)
				} as FeedWithIcon))
			);
			setFeeds(newFeeds);
		}

		fetchFeeds();
	}, []);

	// useEffect(() => {
	// 	console.log(feeds)
	// }, [feeds]);

	return (
		<List>
			{feeds.map(feed => (
				<ListItem key={feed.url}>
					{feed.icon &&
						<Box
							component="img"
							src={feed.icon}
							sx={{
								width: 20,
								height: 20,
								mr: 1
							}}
						/>
					}
					{feed.title ?? feed.link ?? feed.url}
				</ListItem>
			))}
		</List>
	);
}

export default FeedList;
