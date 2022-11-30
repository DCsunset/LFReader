import { Collapse, Divider, Theme, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import EntryList from "./EntryList";
import { useEntries } from "../states/actions";
import { useParams } from "react-router-dom";
import { parseParams } from "../utils/routes";
import { Entry } from "../utils/feed";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../states/app";
import EntryContent from "./EntryContent";
import Loading from "./Loading";
import { Box } from "@mui/system";

interface Props {
	showEntryList: boolean
}

function Main(props: Props) {
	const setNotification = useSetRecoilState(notificationState);
	const smMatch = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
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
				sm={12}
				md="auto"
				sx={{
					maxWidth: {
						sx: "initial",
						md: "300px",
					},
					maxHeight: "100%",
					overflow: "auto"
				}}
			>
				<Collapse
					in={props.showEntryList}
					orientation={smMatch ? "vertical" : "horizontal"}
				>
					<Box sx={{
						display: "flex",
						flexDirection: {
							sm: "column",
							md: "row"
						}
					}}>
						{data
							? <EntryList entries={entries} />
							: <Loading sx={{ mt: 2 }} />
						}

						<Divider
							orientation={smMatch ? "horizontal" : "vertical"}
							flexItem
						/>
					</Box>
				</Collapse>
			</Grid>

			<Grid
				sm={12}
				md
				sx={{
					overflow: "auto",
					height: "100%"
				}}
			>
				{entry && <EntryContent entry={entry} />}
			</Grid>
		</Grid>
	);
}

export default Main;
