import { Grid } from "@mui/material";
import EntryList from "./EntryList";
import { useEntries } from "../states/actions";
import { useParams } from "react-router-dom";
import { parseParams } from "../utils/routes";
import { Entry } from "../utils/feed";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../states/app";
import EntryContent from "./EntryContent";
import Loading from "./Loading";

function EntryListLayout() {
	const setNotification = useSetRecoilState(notificationState);
	// Params should already be validated in parent
	const params = parseParams(useParams());
	const feed = params.type === "feed" ? params.item : undefined;
	const tags = params.type === "tag" ? [params.item!] : undefined;

	// TODO handle errors
	const { data, error } = useEntries({ feed, tags });
	const entries = data ?? [];

	// Current entry
	let entry: Entry | undefined = undefined;
	if (data && params.entry) {
		entry = entries.find(e => e.id === params.entry);
		if (!entry) {
			setNotification({
				color: "error",
				message: "Entry not found"
			});
		}
	}
	
	return (
		<Grid container sx={{ height: "100%" }}>
			<Grid
				item
				sm={12}
				md={4}
				sx={{ overflow: "auto", height: "100%" }}
			>
				{data ? <EntryList entries={entries} /> : <Loading  sx={{ mt: 2 }} />}
			</Grid>
			<Grid item sm={12} md={8}>
				{entry && <EntryContent entry={entry} />}
			</Grid>
		</Grid>
	);
}

export default EntryListLayout;
