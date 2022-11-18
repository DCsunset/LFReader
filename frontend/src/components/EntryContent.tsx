import { Box } from "@mui/material";
import { Entry } from "../utils/feed";

interface Props {
	entry: Entry
}

function EntryContent(props: Props) {
	return (
		<Box>
			{props.entry.title}
		</Box>
	)
}

export default EntryContent;
