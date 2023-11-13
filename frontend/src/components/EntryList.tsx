import { List, ListItemButton, SxProps, Typography } from "@mui/material";
import { route } from "preact-router";
import { computedState, state } from "../store/state";
import { toEntryId } from "../store/feed";
import { effect } from "@preact/signals";

function EntryList() {
	return (
		<List sx={{
			overflow: "auto",
			height: "100%",
		}}>
			{computedState.filteredEntries.value.map(e => {
        const entry_id = toEntryId(e);
        return (
				  <ListItemButton
					  key={entry_id}
					  onClick={() => route(`/?entry=${entry_id}`)}
				  >
					  <Typography>{e.title}</Typography>
				  </ListItemButton>
        )
			})}
		</List>
	)
}

export default EntryList;
