import { Box } from "@mui/material";
import sanitizeHtml from "sanitize-html";
import { Entry } from "../utils/feed";
import "./EntryContent.css";

interface Props {
	entry: Entry
}

function EntryContent(props: Props) {
	const content = sanitizeHtml(
		props.entry.summary ??
		// Concat all contents
		props.entry.content.reduce((res: string[], c) => {
			res.push(c.value);
			return res;
		}, []).join("\n")
	);
	return (
		<Box sx={{ p: 2 }} className="yafr-entry-content">
			<div dangerouslySetInnerHTML={{
				__html: content
			}} />
		</Box>
	)
}

export default EntryContent;
