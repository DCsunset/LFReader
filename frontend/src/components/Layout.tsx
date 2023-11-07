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
import { AppBar, Box, Toolbar, Typography, IconButton, useMediaQuery, Drawer, Stack, SxProps, useTheme } from "@mui/material";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import Icon from '@mdi/react';
import { mdiMenu, mdiBrightness4, mdiBrightness7, mdiCog, mdiFormatListBulleted, mdiRss, mdiRefresh, mdiWeatherNight, mdiWeatherSunny, mdiWhiteBalanceSunny } from '@mdi/js';
import { computed, signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";
import SettingsDialog from "./SettingsDialog";
import Loading from "./Loading";
import { getFeeds } from "../store/actions";

interface Props {
  children?: any
}

const drawerWidth = "220px";
const feeds = computed(() => state.feeds.value);
const entryPanel = signal(true);
const dark = computed(() => state.settings.value.dark);
const settingsDialog = signal(false);
const title = computed(() => {
  const params = state.queryParams.value;
  return params.feed_tag ?? params.feed ?? "All";
});

export default function Layout(props: Props) {
  const theme = useTheme();
  const smallDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const drawer = useSignal(!smallDevice);

  // Responsive style for persistent drawer
  const responsiveStyle = useComputed<SxProps>(() => ({
    // Make animation same as drawer
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(drawer.value && {
      // Make animation same as drawer
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      // width and margin needed when  persisten drawer is shown
      width: { sm: `calc(100% - ${drawerWidth})` },
      ml: { sm: drawerWidth }
    })
  }));

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
      <AppBar
        sx={responsiveStyle.value}
        position="sticky"
      >
        <Toolbar variant="dense" sx={{ minHeight: "50px" }}>
          <IconButton
            color="inherit"
            onClick={() => drawer.value = !drawer.value}
          >
            <Icon
              path={mdiMenu}
              size={1}
            />
          </IconButton>
          <Typography variant="h6" noWrap flexGrow={1} ml={1.5}>
            {title.value}
          </Typography>

          <IconButton
            color="inherit"
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
            width: drawerWidth
          }
        }}
        // For better performance
        ModalProps={{ keepMounted: true }}
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
          <IconButton
            size="small"
            color="inherit"
            title="Update feeds"
            onClick={getFeeds}
          >
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
              <Icon path={mdiWeatherNight} size={1.2} /> :
              <Icon path={mdiWeatherSunny} size={1.2} />}
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

      <Box sx={{ my: 3, ...responsiveStyle.value }}>
        {props.children}
      </Box>
    </>
  );
}

