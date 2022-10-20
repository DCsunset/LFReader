import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import Entry from "./Entry";
import EntryList from "./EntryList";

function EntryListLayout() {
	const params = useParams();
	// TODO: validate type in params
	console.log(params);

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
