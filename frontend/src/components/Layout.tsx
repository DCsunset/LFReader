import { useRecoilState } from "recoil";
import { notificationState } from "../states/app";
import { Notification } from "../types/states";
import { Alert, AppBar, Box, Snackbar, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
	children?: any
}

function Layout(props: Props) {
	const [notification, setNotifiction] = useRecoilState(notificationState);
	// Local cache of notification (delayed destruction and update)
	const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	// Update notification on change
	useEffect(() => {
		if (notification && !currentNotification) {
			setCurrentNotification(notification);
			setNotifiction(null);
			setSnackbarOpen(true);
		}
		else if (notification && currentNotification && snackbarOpen) {
			// Close an active snack when a new one is adde
			setSnackbarOpen(false);
		}
	}, [notification, currentNotification, snackbarOpen])

	
	const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
  };
	
	// Invalidate local cache only after the snackbar closes completely
	const handleSnackbarExited = () => {
		setCurrentNotification(null);
	};

	return (
		<Box sx={{
			height: "100vh",
			display: "flex",
			flexDirection: "column"
		}}>
			<AppBar position="sticky">
				<Toolbar style={{ minHeight: "56px" }}>
					yafr
				</Toolbar>
			</AppBar>

			<Snackbar
				anchorOrigin={{
					horizontal: "center",
					vertical: "bottom"
				}}
				open={snackbarOpen}
				onClose={handleSnackbarClose}
				TransitionProps={{
					onExited: handleSnackbarExited
				}}
				autoHideDuration={5000}
			>
				<Alert
					variant="filled"
					severity={currentNotification?.color}
					onClose={handleSnackbarClose}
				>
					{currentNotification?.message}
				</Alert>
			</Snackbar>

			<div style={{ height: "100%" }}>
				{props.children}
			</div>
		</Box>
	);
}

export default Layout;
