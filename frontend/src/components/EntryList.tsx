import { List, ListItemButton, Typography } from "@mui/material";
import { Base64 } from "js-base64";
import { useNavigate } from "react-router-dom";
import { Entry } from "../utils/feed";

interface Props {
	entries: Entry[]
}

function EntryList(props: Props) {
	const navigate = useNavigate()

	return (
		<List>
			{props.entries.map(e => (
				<ListItemButton
					key={e.id}
					onClick={() => navigate(Base64.encode(e.id, true))}
				>
					<Typography>{e.title}</Typography>
				</ListItemButton>
			))}
		</List>
	)
}

export default EntryList;
