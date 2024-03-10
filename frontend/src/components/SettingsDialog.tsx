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
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { state } from "../store/state";
import { batch, Signal, signal } from "@preact/signals";

const validNumber = (value: string, min: number, max: number) => {
  if (value.length === 0) {
    return false;
  }
  const num = parseInt(value);
  return num >= min && num <= max;
};

// local states
const pageSize = signal(state.settings.value.pageSize.toString());
const pageSizeError = signal(false);
const archive = signal(state.settings.value.archive);

// reset local states
const reset = () => {
  batch(() => {
    pageSize.value = state.settings.value.pageSize.toString();
    archive.value = state.settings.value.archive;
  });
};

export default function SettingsDialog({ open }: {
  open: Signal<boolean>
}) {
  const close = () => {
    open.value = false;
    reset();
  };
  const save = () => {
    if (!pageSizeError.value) {
      batch(() => {
        state.settings.value = {
          ...state.settings.value,
          pageSize: parseInt(pageSize.value),
          archive: archive.value
        };
        open.value = false;
      });
    }
  };

  return (
    <Dialog
      open={open.value}
      onClose={() => open.value = false}
      disableBackdropClick
      fullWidth
    >
      <DialogTitle sx={{ pb: 0 }}>Settings</DialogTitle>
      <DialogContent sx={{ px: 1 }}>
        <List>
          <Box sx={{ mx: 2, mt: 2 }}>
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              General
            </Typography>
            <Divider />
          </Box>

          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <ListItemText secondary={
                  <span>
                    positive integer
                  </span>
                }>
                  Number of entries per page
                </ListItemText>
              </Grid>
              <Grid item>
                <TextField
                  variant="standard"
                  type="number"
                  sx={{ maxWidth: "45px" }}
                  error={pageSizeError.value}
                  value={pageSize.value}
                  onChange={(event: any) => {
                    const value = event.target.value;
                    pageSizeError.value = !validNumber(value, 1, Number.MAX_SAFE_INTEGER);
                    pageSize.value = value;
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
                    download resources (e.g. images) and save them locally
                  </span>
                }>
                  Archive resources
                </ListItemText>
              </Grid>
              <Grid item>
                <Checkbox
                  checked={archive.value}
                  onChange={(e: any) => archive.value = e.target.checked}
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

