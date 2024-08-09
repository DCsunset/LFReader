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

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from "@mui/material";
import { batch, signal, useComputed, useSignalEffect } from "@preact/signals";
import { FeedUserData, getFeedTitle } from "../store/feed";
import { archiveFeeds, handleExternalLink } from "../store/actions";
import Icon from "@mdi/react";
import { mdiContentSave, mdiOpenInNew } from "@mdi/js";
import { LoadingButton } from "@mui/lab";
import { appState, lookupFeed } from "../store/state";

// local states
const alias = signal("");
const baseUrl = signal("");
const afterDate = signal("");
const archiveBlacklist = signal("");
const archiveSequential = signal(false);
const archiveInterval = signal("");
const archiveIntervalError = signal(false);
const archiveInProgress = signal(false);

export default function FeedDialog() {
  const { open, feed, onSave } = appState.feedDialog;
  const existing = useComputed(() => Boolean(lookupFeed(feed.value?.url)));

  // reset local states
  const reset = () => {
    // subscribe to feed
    const f = feed.value;
    batch(() => {
      alias.value = f?.user_data.alias ?? "";
      baseUrl.value = f?.user_data.base_url ?? "";
      afterDate.value = f?.user_data.after_date ?? "";
      archiveBlacklist.value = f?.user_data.archive_blacklist ?? "";
      archiveSequential.value = f?.user_data.archive_sequential ?? false;
      archiveInterval.value = f?.user_data.archive_interval?.toString() ?? "";
      archiveIntervalError.value = false;
    });
  };
  const close = () => {
    open.value = false;
  };

  const save = async () => {
    // No need to update the feed signal as no UI depends on user_data
    const userData: FeedUserData = {
      ...(feed.value?.user_data || {}),
      alias: alias.value || undefined,
      base_url: baseUrl.value || undefined,
      after_date: afterDate.value || undefined,
      archive_blacklist: archiveBlacklist.value || undefined,
      archive_sequential: archiveSequential.value || undefined,
      archive_interval: (archiveInterval.value && parseFloat(archiveInterval.value)) || undefined
    };
    const ok = await onSave(feed.value, userData);
    if (ok) {
      close();
    }
  };

  async function handleArchive() {
    archiveInProgress.value = true;
    await archiveFeeds([feed.value.url]);
    archiveInProgress.value = false;
  }

  // Reset local states when feed changes
  useSignalEffect(reset);

  return (
    <Dialog
      open={open.value}
      onClose={close}
      disableBackdropClick
      fullWidth
    >
      <DialogTitle sx={{ pb: 0 }}>
        Feed Settings for <em>{getFeedTitle(feed.value)}</em>
      </DialogTitle>
      <DialogContent sx={{ px: 1 }}>
        <List>
          <Box sx={{ mx: 2, mt: 2 }}>
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              General
            </Typography>
            <Divider />
          </Box>

          {feed.value?.link &&
            <ListItem>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <ListItemText>
                    Feed Home Page
                  </ListItemText>
                </Grid>
                <Grid item>
                  <a
                    href={feed.value?.link}
                    target="_blank"
                    onClick={handleExternalLink}
                  >
                    {feed.value?.title || "(No Title)"}
                  </a>
                </Grid>
              </Grid>
            </ListItem>
          }

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText>
                  Feed URL
                </ListItemText>
              </Grid>
              <Grid item>
                <IconButton
                  color="inherit"
                  href={feed.value?.url}
                  onClick={handleExternalLink}
                >
                  <Icon path={mdiOpenInNew} size={1} />
                </IconButton>
              </Grid>
            </Grid>
          </ListItem>

          {existing.value &&
            <ListItem>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <ListItemText>
                    Feed Operations
                  </ListItemText>
                </Grid>
                <Grid item>
                  <LoadingButton
                    loading={archiveInProgress.value}
                    loadingPosition="start"
                    color="primary" onClick={handleArchive}
                    startIcon={<Icon path={mdiContentSave} size={1} />}
                  >
                    <Box sx={{ mt: 0.2 }}>Archive</Box>
                  </LoadingButton>
                </Grid>
              </Grid>
            </ListItem>
          }

          <Box sx={{ mx: 2, mt: 2 }}>
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              User Data
            </Typography>
            <Divider />
          </Box>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    an alias for feed title
                  </span>
                }>
                  Alias
                </ListItemText>
              </Grid>
              <Grid item>
                <TextField
                  variant="standard"
                  value={alias.value}
                  placeholder={feed.value?.title || "(No Title)"}
                  onChange={(event: any) => {
                    alias.value = event.target.value;
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    used for archiving resources
                  </span>
                }>
                  Resource Base URL
                </ListItemText>
              </Grid>
              <Grid item>
                <TextField
                  variant="standard"
                  value={baseUrl.value}
                  placeholder="(auto)"
                  onChange={(event: any) => {
                    baseUrl.value = event.target.value;
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    only fetch entries after a date (ISO format)
                  </span>
                }>
                  After Date
                </ListItemText>
              </Grid>
              <Grid item>
                <TextField
                  variant="standard"
                  value={afterDate.value}
                  placeholder="(none)"
                  onChange={(event: any) => {
                    afterDate.value = event.target.value;
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    url regex to blacklist when archiving
                  </span>
                }>
                  Archive Blacklist
                </ListItemText>
              </Grid>
              <Grid item>
                <TextField
                  variant="standard"
                  value={archiveBlacklist.value}
                  placeholder="(none)"
                  onChange={(event: any) => {
                    archiveBlacklist.value = event.target.value;
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    archive resources sequentially instead of concurrently
                  </span>
                }>
                  Archive Sequentially
                </ListItemText>
              </Grid>
              <Grid item>
                <Checkbox
                  checked={archiveSequential.value}
                  onChange={(e: any) => archiveSequential.value = e.target.checked}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    only applied when archiving sequentially (in seconds)
                  </span>
                }>
                  Archive Interval
                </ListItemText>
              </Grid>
              <Grid item>
                <TextField
                  variant="standard"
                  sx={{ maxWidth: "45px" }}
                  error={archiveIntervalError.value}
                  value={archiveInterval.value}
                  disabled={!archiveSequential.value}
                  onChange={(event: any) => {
                    const value = event.target.value;
                    archiveIntervalError.value = Boolean(value && !(parseFloat(value) > 0));
                    archiveInterval.value = value;
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={close}>Cancel</Button>
        <Button color="error" onClick={reset}>Reset</Button>
        <Button color="primary" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

