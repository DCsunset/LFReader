import { Grid } from "@mui/material";
import Entry from "./Entry";
import EntryList from "./EntryList";

function EntryListLayout() {
	return (
		<Grid container>
			<Grid item sm={12} md={4}>
				<EntryList />
			</Grid>
			<Grid item sm={12} md={8}>
				<Entry />
			</Grid>
		</Grid>
	);
}

export default EntryListLayout;
