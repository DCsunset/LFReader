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

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from "@mui/material";
import { batch, Signal, signal, useSignalEffect } from "@preact/signals";
import { Feed } from "../store/feed";
import { updateFeed } from "../store/actions";

// local states
const baseUrl = signal("");

export default function FeedDialog({ open, feed }: {
  open: Signal<boolean>,
  feed: Signal<Feed|null>
}) {
  // reset local states
  const reset = () => {
    batch(() => {
      baseUrl.value = feed.value?.user_data.base_url ?? "";
    });
  };
  const close = () => {
    open.value = false;
    reset();
  };
  const save = async () => {
    // No need to update the feeds signal as no UI depends on user_data
    feed.value.user_data.base_url = baseUrl.value || undefined;
    if (await updateFeed(feed.value.url, feed.value.user_data)) {
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
      <DialogTitle sx={{ pb: 0 }}>Feed Settings</DialogTitle>
      <DialogContent sx={{ px: 1 }}>
        <List>
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

