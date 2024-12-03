// LFReader
// Copyright (C) 2022-2024  DCsunset

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

import { createRef } from "preact";
import { computedState, appState } from "../store/state";
import { AppBar, Box, Toolbar, Typography, IconButton, useMediaQuery, Drawer, Stack, SxProps, useTheme, Slide, Zoom, Fab, CircularProgress } from "@mui/material";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { useEffect } from "preact/hooks";
import Icon from '@mdi/react';
import { mdiMenu, mdiCog, mdiFormatListBulleted, mdiRss, mdiRefresh, mdiWeatherNight, mdiWeatherSunny, mdiDownload, mdiPlus, mdiArrowCollapseUp, mdiLeadPencil, mdiCodeTags, mdiInformation, mdiInformationOutline } from '@mdi/js';
import { computed, signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";
import SettingsDialog from "./SettingsDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { loadData, fetchData, handleExternalLink } from "../store/actions";
import FeedList from "./FeedList";
import EntryList from "./EntryList";
import NewFeedsDialog from "./NewFeedsDialog";
import Entry from "./Entry";
import { getEntryTitle, getFeedTitle } from "../store/feed";
import { anchorNoStyle } from "../utils/styles";
import FeedDialog from "./FeedDialog";
import AboutDialog from "./AboutDialog";

const feedListWidth = "250px";
const entryListWidth = "350px";
const toolbarHeight = "50px";
const entryList = signal(true);
const dark = computed(() => appState.settings.value.dark);
const settingsDialog = signal(false);
const feedsDialog = signal(false);
const aboutDialog = signal(false);
const editing = appState.ui.editingFeeds;
const loading = appState.status.loading;
const loadDataInProgress = signal(false);

const selectedFeed = computedState.selectedFeed;
const selectedEntry = computedState.selectedEntry;
const selectedEntryFeed = computedState.selectedEntryFeed;

const entryRef = createRef<HTMLElement>();
const scrollButton = signal(false);
const scrollToTop = () => {
  entryRef.current?.scrollTo({ top: 0, behavior: "smooth" });
};

export default function Layout() {
  const theme = useTheme();
  const smallDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const feedList = useSignal(!smallDevice);

  // Responsive style for showing list peer
  const feedListPeerStyle = useComputed<SxProps>(() => ({
    // Make animation same as drawer
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(feedList.value && {
      // Make animation same as drawer
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      // width and margin needed when  persisten drawer is shown
      width: { sm: `calc(100% - ${feedListWidth})` },
      ml: { sm: feedListWidth }
    })
  }));

  const entryListPeerStyle = useComputed<SxProps>(() => ({
    // Make animation same as drawer
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(entryList.value && {
      // Make animation same as drawer
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      // width and margin needed when  persisten drawer is shown
      width: {
        xs: 0,
        sm: `calc(100% - ${entryListWidth})`
      },
      ml: {
        xs: "100%",
        sm: entryListWidth
      },
    })
  }));

  const toggleTheme = () => {
    appState.settings.value = {
      ...appState.settings.value,
      dark: !dark.value
    };
  };

  async function handleLoadData() {
    loadDataInProgress.value = true;
    await loadData();
    loadDataInProgress.value = false;
  }

  useSignalEffect(() => {
    const notification = appState.notification.value;
    if (notification) {
      const { text, color } = notification;
      enqueueSnackbar(text, { variant: color });
    }
  });

  useEffect(() => {
    // Show scroll button when pageY is greater than a value
    // Must use effect hook as entryRef is only available after mounting
    const element = entryRef.current;
    element?.addEventListener("scroll", () => {
      scrollButton.value = element!.scrollTop > 200;
    });
  }, []);

  return (
    <>
      {/* Disable backgroundImage to avoid color change in dark theme */}
      <AppBar
        sx={feedListPeerStyle.value}
        position="sticky"
      >
        <Toolbar variant="dense" sx={{ minHeight: toolbarHeight }}>
          <IconButton
            color="inherit"
            title="Feed List"
            onClick={() => feedList.value = !feedList.value}
          >
            <Icon
              path={mdiMenu}
              size={1}
            />
          </IconButton>
          <Typography variant="h6" noWrap flexGrow={1} ml={1.5}>
            {selectedEntry.value ?
              <>
                <a
                  href={selectedEntryFeed.value?.link}
                  target="_blank"
                  style={anchorNoStyle}
                  onClick={handleExternalLink}
                >
                  {getFeedTitle(selectedEntryFeed.value)}
                </a>
                <Box sx={{display: "inline", mx: "0.75rem" }}>
                  |
                </Box>
                <a
                  href={selectedEntry.value.link}
                  target="_blank"
                  style={anchorNoStyle}
                  onClick={handleExternalLink}
                >
                  {getEntryTitle(selectedEntry.value)}
                </a>
              </> :
              <a
                href={selectedFeed.value?.link}
                target="_blank"
                style={anchorNoStyle}
                onClick={handleExternalLink}
              >
                {getFeedTitle(selectedFeed.value, "All")}
              </a>
            }
          </Typography>

          <IconButton
            color="inherit"
            title="Entry List"
            onClick={() => entryList.value = !entryList.value}
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
            width: `min(90%, ${feedListWidth})`
          }
        }}
        // For better performance
        ModalProps={{ keepMounted: true }}
        open={feedList.value}
        onClose={() => feedList.value = false}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Icon
            path={mdiRss}
            size={1.2}
            color="#ee802f"
          />
          <Typography variant="h5" sx={{ ml: 1 }}>
            LFReader
          </Typography>
        </Box>

        <Stack direction="row-reverse" sx={{ mx: 1.5, mb: 1 }}>
          <IconButton
            size="small"
            color="inherit"
            title="Reload local feeds"
            onClick={handleLoadData}
            disabled={loadDataInProgress.value}
          >
            {loadDataInProgress.value
              ? <CircularProgress color="inherit" size={24} />
              : <Icon path={mdiRefresh} size={1} />
            }
          </IconButton>
          <IconButton
            size="small"
            color="inherit"
            title="Fetch feeds from origin"
            onClick={() => fetchData()}
            disabled={loading.value}
          >
            {loading.value
              ? <CircularProgress color="inherit" size={24} />
              : <Icon path={mdiDownload} size={1} />
            }
          </IconButton>
          <IconButton
            size="small"
            color="inherit"
            title="Add feeds"
            onClick={() => feedsDialog.value = true}
          >
            <Icon
              path={mdiPlus}
              size={1}
            />
          </IconButton>
          <IconButton
            size="small"
            color={editing.value ? "primary" : "inherit"}
            title="Edit feeds"
            onClick={() => editing.value = !editing.value}
          >
            <Icon
              path={mdiLeadPencil}
              size={1}
            />
          </IconButton>
        </Stack>

        <Box sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "auto"
        }}>
          <FeedList onClick={() => {
            if (smallDevice) {
              feedList.value = false;
            }
            entryList.value = true;
          }} />
        </Box>

        <Stack direction="row-reverse" sx={{ m: 1.5 }}>
          <IconButton
            color="inherit"
            title="Settings"
            onClick={() => settingsDialog.value = true}
          >
            <Icon path={mdiCog} size={1} />
          </IconButton>

          <IconButton
            color="inherit"
            title={`Switch to ${dark.value ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            {dark.value ?
              <Icon path={mdiWeatherNight} size={1} /> :
              <Icon path={mdiWeatherSunny} size={1} />}
          </IconButton>

          <IconButton
            color="inherit"
            title="API Docs"
            href="/api/docs"
            target="_blank"
          >
            <Icon path={mdiCodeTags} size={1} />
          </IconButton>

          <IconButton
            color="inherit"
            title="About"
            onClick={() => aboutDialog.value = true}
          >
            <Icon path={mdiInformationOutline} size={1} />
          </IconButton>
        </Stack>
      </Drawer>

      <AboutDialog open={aboutDialog} />
      <SettingsDialog open={settingsDialog} />
      <NewFeedsDialog open={feedsDialog} />
      <FeedDialog />

      <ConfirmationDialog />
      <SnackbarProvider anchorOrigin={{ horizontal: "center", vertical: "bottom" }} />

      <Box sx={feedListPeerStyle.value}>
        <Slide in={entryList.value} direction="right">
          <Box sx={{
            // must be absolute to make main body able to occupy the same space
            position: "absolute",
            width: {
              xs: "100%",
              sm: entryListWidth,
            },
            height: `calc(100vh - ${toolbarHeight})`,
            borderRight: `1px solid ${theme.palette.divider}`
          }}>
            <EntryList onClick={() => {
              if (smallDevice) {
                entryList.value = false;
              }
              scrollToTop();
            }} />
          </Box>
        </Slide>

        <Box ref={entryRef} sx={{
          py: 4,
          px: {
            xs: entryList.value ? 0 : 2,
            sm: 4,
            md: 6,
            lg: 8
          },
          height: `calc(100vh - ${toolbarHeight})`,
          overflowY: "scroll",
          ...entryListPeerStyle.value
        }}>
          <Entry />
        </Box>

        {/* Scroll-to-top button */}
        <Zoom in={scrollButton.value}>
          <Fab
            size="small"
            title="Scroll to top"
            className="!fixed bottom-5 right-5"
            onClick={scrollToTop}
          >
            <Icon path={mdiArrowCollapseUp} size={0.9} />
          </Fab>
        </Zoom>
      </Box>
    </>
  );
}

