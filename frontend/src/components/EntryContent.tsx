import { useLayoutEffect, useRef } from "react";
import { Box } from "@mui/material";
import sanitizeHtml from "sanitize-html";
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import { Entry } from "../utils/feed";
import "./EntryContent.css";

interface Props {
	entry: Entry
}

function EntryContent(props: Props) {
	const contentRef = useRef<HTMLElement>(null);

	const content = sanitizeHtml(
		props.entry.summary ??
		// Concat all contents
		props.entry.content.reduce((res: string[], c) => {
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
			<div dangerouslySetInnerHTML={{
				__html: content
			}} />
		</Box>
	)
}

export default EntryContent;
