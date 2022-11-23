import { useRecoilState, useRecoilValue } from "recoil";
import { notificationState, feedListState } from "../states/app";
import { Notification } from "../types/states";
import { Alert, AppBar, Box, Drawer, IconButton, Snackbar, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Icon } from "@mdi/react";
import { Outlet, useParams } from "react-router-dom";
import { mdiMenu, mdiRss } from "@mdi/js";
import FeedList from "./FeedList";
import Loading from "./Loading";
import { parseParams } from "../utils/routes";

const drawerWidth = "240px";
const appBarHeight = "48px";

function Layout() {
	const feeds = useRecoilValue(feedListState);
	// TODO: validate type in params
	const params = parseParams(useParams());

	let title = feeds ? "Home" : "Loading...";
	if (feeds) {
		if (params.type === "tag") {
			title = params.item!;
		}
		else if (params.type === "feed") {
			const feedUrl = params.item!;
			// Should always be found after validation
			const feed = feeds.find(f => f.url === feedUrl)!;
			title = feed.title ?? feed.link ?? feed.url;
		}
	}

	const [notification, setNotification] = useRecoilState(notificationState);
	// Local cache of notification (delayed destruction and update)
	const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const theme = useTheme();
	const smallDevice = useMediaQuery(theme.breakpoints.down("sm"));
	const [drawerOpen, setDrawerOpen] = useState(!smallDevice);

	useEffect(() => {
		// Reset to default state
		setDrawerOpen(!smallDevice);
	}, [smallDevice])

	// Update notification on change
	useEffect(() => {
		if (notification && !currentNotification) {
			setCurrentNotification(notification);
			setNotification(null);
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

	const responsiveStyles = {
		// Keep the animation same as drawer
		transition: theme.transitions.create(["margin", "width"], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		...(drawerOpen && {
			transition: theme.transitions.create(["margin", "width"], {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.leavingScreen
			}),
			// Leave space for responsive drawer
			width: {
				sm: `calc(100% - ${drawerWidth})`
			},
			ml: {
				sm: drawerWidth
			}
		})
	};

	return (
		<Box sx={{
			height: "100vh",
			display: "flex",
			flexDirection: "column"
		}}>
			<AppBar
				position="sticky"
				sx={responsiveStyles}
			>
				<Toolbar variant="dense" sx={{
					minHeight: appBarHeight,
					// Keep padding consistent
					px: { sm: 2 }
				}}>
					<IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
						<Icon
							path={mdiMenu}
							size={1}
						/>
					</IconButton>
					<Typography variant="h6" sx={{ ml: 1 }}>
						{title}
					</Typography>
				</Toolbar>
			</AppBar>

			<Box
				component="nav"
				sx={{
					width: { sm: drawerWidth },
					flexShrink: { sm: 0 }
				}}
			>
				<Drawer
					variant={smallDevice ? "temporary" : "persistent"}
					anchor="left"
					// Change width of paper component inside drawer
					PaperProps={{
						sx: {
							width: drawerWidth
						}
					}}
					// For better performance
					ModalProps={{
						keepMounted: true
					}}
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							p: 1,
						}}
					>
						<Icon
							path={mdiRss}
							size={1.2}
							color="#ee802f"
						/>
						<Typography variant="h5" sx={{ ml: 0.5 }}>
							yafr
						</Typography>
					</Box>

					{feeds ? <FeedList /> : <Loading sx={{ mt: 2 }} />}
				</Drawer>
			</Box>

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
				autoHideDuration={6000}
			>
				<Alert
					variant="filled"
					severity={currentNotification?.color}
					onClose={handleSnackbarClose}
				>
					{currentNotification?.message}
				</Alert>
			</Snackbar>

			<Box component="main" sx={{
				flexGrow: 1,
				height: `calc(100% - ${appBarHeight})`,
				...responsiveStyles
			}}>
				{feeds ? <Outlet/> : <Loading sx={{ mt: 2 }} />}
			</Box>
		</Box>
	);
}

export default Layout;
