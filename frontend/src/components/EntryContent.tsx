import { useLayoutEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import sanitizeHtml from "sanitize-html";
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import { Entry, getFeedTitle } from "../utils/feed";
import "./EntryContent.css";
import { displayDate } from "../utils/date";
import { useRecoilValue } from "recoil";
import { feedMapState } from "../states/app";

interface Props {
	entry: Entry
}

function EntryContent(props: Props) {
	const feedMap = useRecoilValue(feedMapState);
	const contentRef = useRef<HTMLElement>(null);

	const entry = props.entry;
	// Get corresponding feed
	const feed = feedMap[entry.feed_url];
	const date = entry.updated ?? entry.published;

	const content = sanitizeHtml(
		entry.summary ??
		// Concat all contents
		entry.content.reduce((res: string[], c) => {
			res.push(c.value);
			return res;
		}, []).join("\n")
	);

	// Mutating DOM synchronously after it's loaded
	useLayoutEffect(() => {
		if (contentRef.current) {
			contentRef.current.querySelectorAll("pre code").forEach(el => {
				hljs.highlightElement(el as HTMLElement);
			});
		}
	});

	return (
		<Box
			sx={{ p: 2 }}
			className="yafr-entry-content"
			ref={contentRef}
		>
			<Box sx={{ mb: 2.5 }}>
				<Typography variant="h5" gutterBottom>
					{entry.title}
				</Typography>
				{feed && (
					<Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
						{getFeedTitle(feed)}
					</Typography>
				)}
				{date && (
					<Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
						{displayDate(date)}
					</Typography>
				)}
			</Box>

			<div dangerouslySetInnerHTML={{
				__html: content
			}} />
		</Box>
	)
}

export default EntryContent;
