// Copyright (C) 2022-2023  DCsunset

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.


import { mdiChevronRight, mdiTag } from "@mdi/js";
import { Box, Collapse, IconButton, List, ListItemButton } from "@mui/material";
import { useState } from "react";
import { Icon } from "@mdi/react";
import { FeedWithIcon } from "../states/actions";
import { getFeedTags, filterFeedsByTag, getFeedTitle } from "../utils/feed";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { feedListState } from "../states/app";
import { Base64 } from "js-base64";

/**
 * Feed Tag (including feeds of this tag)
 */
function FeedTag(props: {
	/// Tag name (undefined means all tags)
	tag?: string,
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
					if (props.tag) {
						navigate(`/tag/${Base64.encode(props.tag, true)}`);
					}
					else {
						// All tags
						navigate("/");
					}
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
					<span>{props.tag ?? "All"}</span>
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
							{getFeedTitle(feed)}
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
			{/* All tags */}
			<FeedTag
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
