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
import { batch, Signal, signal, useSignalEffect } from "@preact/signals";
import { Feed, getFeedTitle } from "../store/feed";
import { updateFeed } from "../store/actions";
import Icon from "@mdi/react";
import { mdiOpenInNew } from "@mdi/js";

// local states
const baseUrl = signal("");
const alias = signal("");

export default function FeedDialog({ open, feed }: {
  open: Signal<boolean>,
  feed: Signal<Feed|undefined>
}) {
  // reset local states
  const reset = () => {
    batch(() => {
      baseUrl.value = feed.value?.user_data.base_url ?? "";
      alias.value = feed.value?.user_data.alias ?? "";
    });
  };
  const close = () => {
    open.value = false;
    reset();
  };
  const save = async () => {
    // No need to update the feed signal as no UI depends on user_data
    const f = feed.value;
    const userData = {
      ...f.user_data,
      base_url: baseUrl.value || undefined,
      alias: alias.value || undefined
    };
    // Feeds signal updated in the action
    if (await updateFeed(f.url, userData)) {
      close();
    }
  };

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
              Info
            </Typography>
            <Divider />
          </Box>

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
                >
                  {feed.value?.title || "(No Title)"}
                </a>
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText>
                  Feed URL
                </ListItemText>
              </Grid>
              <Grid item>
                <IconButton color="inherit" href={feed.value?.url}>
                  <Icon path={mdiOpenInNew} size={1} />
                </IconButton>
              </Grid>
            </Grid>
          </ListItem>

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
                    an alias to display as feed title
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

