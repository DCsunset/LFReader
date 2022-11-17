import { Box, CircularProgress, SxProps } from "@mui/material";

interface Props {
	sx?: SxProps
}

function Loading(props: Props) {
	return (
		<Box sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			...props.sx
		}}>
			<CircularProgress size={32} thickness={4} />
		</Box>
	)
}

export default Loading;
