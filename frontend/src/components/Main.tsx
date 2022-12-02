import { Collapse, Theme, useMediaQuery, useTheme } from "@mui/material";
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
	const theme = useTheme();
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

	return data ? (
		<Grid container sx={{ height: "100%" }}>
			<Grid
				sm={12}
				md="auto"
				sx={{
					borderRight: {
						md: `1px solid ${theme.palette.divider}`
					},
					borderBottom: {
						sm: `1px solid ${theme.palette.divider}`
					},
					maxWidth: {
						sm: "initial",
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
						<EntryList entries={entries} />
					</Box>
				</Collapse>
				{/* <Divider
					orientation={smMatch ? "horizontal" : "vertical"}
					sx={{ display: "flex" }}
				/> */}
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
	) : <Loading sx={{ height: "100%" }} />;
}

export default Main;
