// Copyright (C) 2022-2023  DCsunset

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { state } from "../store/state";
import { AppBar, Box, Toolbar, Typography, IconButton, useMediaQuery, Drawer, Stack } from "@mui/material";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { blue } from "@mui/material/colors";
import Icon from '@mdi/react';
import { mdiMenu, mdiBrightness4, mdiBrightness7, mdiCog, mdiFormatListBulleted, mdiRss, mdiRefresh } from '@mdi/js';
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import SettingsDialog from "./SettingsDialog";
import Loading from "./Loading";
import { getFeeds } from "../store/actions";

interface Props {
  children?: any
}

export default function Layout(props: Props) {
	const smallDevice = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const dark = useComputed(() => state.settings.value.dark);
  const settingsDialog = useSignal(false);
  const drawer = useSignal(!smallDevice);
  const entryPanel = useSignal(true);
  const feeds = useComputed(() => state.feeds.value);

  const toggleTheme = () => {
    state.settings.value = {
      ...state.settings.value,
      dark: !dark.value
    };
  };

  useSignalEffect(() => {
    const notification = state.notification.value;
    if (notification) {
      const { text, color } = notification;
      enqueueSnackbar(text, { variant: color });
    }
  });

  return (
    <>
      {/* Disable backgroundImage to avoid color change in dark theme */}
      <AppBar sx={{ backgroundColor: blue[700], backgroundImage: "none" }} position="sticky">
        <Toolbar>
					<IconButton onClick={() => drawer.value = !drawer.value}>
						<Icon
							path={mdiMenu}
							size={1}
						/>
					</IconButton>
          <Typography variant="h6" noWrap flexGrow={1} ml={1.5}>
            Task.json Web
          </Typography>

					<IconButton
						title="Entry Panel"
						onClick={() => entryPanel.value = !entryPanel}
					>
						<Icon
							path={mdiFormatListBulleted}
							size={1}
						/>
					</IconButton>
        </Toolbar>
      </AppBar>

			<Drawer
				variant={smallDevice ? "temporary" : "persistent"}
				anchor="left"
				// Change width of paper component inside drawer
				PaperProps={{
					sx: {
						width: "240px"
					}
				}}
				// For better performance
				ModalProps={{
					keepMounted: true
				}}
				open={drawer.value}
				onClose={() => drawer.value = false}
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

				<Box sx={{
					display: "flex",
					flexGrow: 1,
					overflow: "auto"
				}}>
					{/* feeds ? <FeedList /> : <Loading sx={{ height: "100%", width: "100%" }} /> */}
				</Box>

				<Stack direction="row-reverse" sx={{ m: 1.5 }}>
					<IconButton size="small" title="Update feeds" onClick={getFeeds}>
						<Icon
							path={mdiRefresh}
							size={1.2}
						/>
					</IconButton>
					<IconButton
            size="small"
						color="inherit"
						title={`Switch to ${dark.value ? "light" : "dark"} mode`}
						onClick={toggleTheme}
					>
						{dark.value ?
              <Icon path={mdiBrightness4} size={1.2} /> :
              <Icon path={mdiBrightness7} size={1.2} />}
					</IconButton>

					<IconButton
						color="inherit"
						title="Settings"
						onClick={() => settingsDialog.value = true}
					>
            <Icon path={mdiCog} size={1.2} />
					</IconButton>
				</Stack>
			</Drawer>


      <SettingsDialog open={settingsDialog} />

      <SnackbarProvider anchorOrigin={{ horizontal: "center", vertical: "bottom" }} />

      <Box sx={{ my: 3 }}>
				{props.children}
      </Box>
    </>
  );
}

