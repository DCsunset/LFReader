import { List, ListItemButton, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEntries } from "../states/actions";
import { Params } from "../types/routes";

function EntryList() {
	// Params should already be validated in parent
	const params: Params = useParams();
	const feed = params.type === "feed" ? params.item : undefined;
	const tags = params.type === "tag" ? [params.item!] : undefined;

	// TODO handle errors
	const { data, error } = useEntries({ feed, tags });
	const entries = data ?? [];

	return (
		<List>
			{entries.map(e => (
				<ListItemButton key={e.id}>
					<Typography>{e.title}</Typography>
				</ListItemButton>
			))}
		</List>
	)
}

export default EntryList;
