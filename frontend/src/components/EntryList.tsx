import { Box } from "@mui/material";
import { useParams } from "react-router-dom";

function EntryList() {
	// Params should already be validated in parent
	const params = useParams();

	return (
		<Box>
			Entry list
		</Box>
	)
}

export default EntryList;
