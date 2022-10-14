import { mdiChevronRight } from "@mdi/js";
import { Box, Collapse, IconButton, List, ListItem, ListItemButton } from "@mui/material";
import { useEffect, useState } from "react";
import { Icon } from "@mdi/react";
import { getFeeds } from "../states/actions";
import { getTags, Feed, filterByTag } from "../types/feed";
import fetchIcon from "../utils/fetchIcon";
import { useSetRecoilState } from "recoil";
import { titleState } from "../states/app";

export interface FeedWithIcon extends Feed {
	icon?: string
};

interface ActiveItem {
	/// A single feed or a tag
	type: "feed" | "tag",
	title: string
};

/**
 * Feed Tag (including feeds of this tag)
 */
function FeedTag(props: {
	/// Tag name
	tag: string,
	/// Feeds of this tag
	feeds: FeedWithIcon[],
}) {
	const [open, setOpen] = useState(false);
	const setTitle = useSetRecoilState(titleState);

	const showItem = (item: ActiveItem) => {
		setTitle(item.title);
		// TODO: show feed or group
	};

	return (
		<>
			<ListItemButton
				sx={{ p: 0.5 }}
				onClick={() => showItem({
					type: "tag",
					title: props.tag
				})}
			>
				<Box sx={{
					display: "flex",
					alignItems: "center"
				}}>
					<IconButton
						size="small"
						onClick={e => {
							// Don't call the upper callback
							e.stopPropagation();
							setOpen(!open);
						}}
					>
						<Icon
							path={mdiChevronRight}
							size={1}
							style={{
								transform: `rotate(${open ? "90deg" : "0"})`,
								transition: "transform 0.2s"
							}}
						/>
					</IconButton>
					{props.tag}
				</Box>
			</ListItemButton>
			<Collapse in={open}>
				{props.feeds.map(feed => (
					<ListItemButton
						key={feed.url}
						sx={{ p: 0.5, pl: 4 }}
						onClick={() => showItem({
							type: "feed",
							title: feed.title ?? feed.link ?? feed.url
						})}
					>
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
					</ListItemButton>
				))}
			</Collapse>
		</>
	);
}

function FeedList() {
	const [feeds, setFeeds] = useState<FeedWithIcon[]>([]);

	// TODO: use SWR to optimize data fetching
	useEffect(() => {
		const fetchFeeds = async () => {
			const origFeeds = await getFeeds();
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

	// All tags
	const tags = getTags(feeds);

	return (
		<List>
			{tags.map(tag => (
				<FeedTag
					key={tag || "Unsorted"}
					tag={tag || "Unsorted"}
					feeds={filterByTag(feeds, tag)}
				/>
			))}
		</List>
	);
}

export default FeedList;
