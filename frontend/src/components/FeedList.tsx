import { mdiChevronRight, mdiTag } from "@mdi/js";
import { Box, Collapse, IconButton, List, ListItemButton } from "@mui/material";
import { useState } from "react";
import { Icon } from "@mdi/react";
import { FeedWithIcon } from "../states/actions";
import { getFeedTags, filterFeedsByTag } from "../utils/feed";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { feedListState } from "../states/app";
import { Base64 } from "js-base64";

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
	/// Hide list of feeds
	hideList?: boolean
}) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	return (
		<>
			<ListItemButton
				sx={{ py: 0, px: 0.5 }}
				onClick={() => {
					if (!open) {
						setOpen(true);
					}
					navigate(`/tag/${Base64.encode(props.tag, true)}`);
				}}
			>
				<Box sx={{
					display: "flex",
					alignItems: "center"
				}}>
					{props.hideList ? (
						<Box sx={{
							p: 1.05,
							display: "flex",
							alignItems: "center"
						}}>
							<Icon path={mdiTag} size={0.75} />
						</Box>
					) : (
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
					)
					}
					<span>{props.tag}</span>
					<Box sx={{
						ml: 0.8,
						mt: 0.1,
						fontSize: "0.75rem",
						display: "inline"
					}}>
						({props.feeds.length})
					</Box>
				</Box>
			</ListItemButton>
			{!props.hideList &&
				<Collapse in={open}>
					{props.feeds.map(feed => (
						<ListItemButton
							key={feed.url}
							sx={{ p: 0.5, pl: 4 }}
							onClick={() => navigate(
								`/feed/${Base64.encode(feed.url, true)}`
							)}
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
			}
		</>
	);
}

function FeedList() {
	// This component won't render If feeds is null
	const feeds = useRecoilValue(feedListState)!;
	// All tags
	const tags = getFeedTags(feeds);

	return (
		<List>
			<FeedTag
				tag="All"
				feeds={feeds}
				hideList={true}
			/>
			{tags.map(tag => (
				<FeedTag
					key={tag || "Unsorted"}
					tag={tag || "Unsorted"}
					feeds={filterFeedsByTag(feeds, tag)}
				/>
			))}
		</List>
	);
}

export default FeedList;
