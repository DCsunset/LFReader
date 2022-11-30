import { List, ListItemButton, SxProps, Typography } from "@mui/material";
import { Base64 } from "js-base64";
import { useNavigate, useParams } from "react-router-dom";
import { Entry } from "../utils/feed";

interface Props {
	entries: Entry[],
	sx?: SxProps
}

function EntryList(props: Props) {
	const navigate = useNavigate()
	const params = useParams();
	// Use _ as placeholder for tag All
	const type = params.type ?? "tag";
	const item = params.item ?? "_";

	return (
		<List sx={{
			overflow: "auto",
			height: "100%",
			...props.sx
		}}>
			{props.entries.map(e => (
				<ListItemButton
					key={e.id}
					onClick={() => navigate(`/${type}/${item}/${Base64.encode(e.id, true)}`)}
				>
					<Typography>{e.title}</Typography>
				</ListItemButton>
			))}
		</List>
	)
}

export default EntryList;
