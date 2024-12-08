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
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { appState } from "../store/state";
import { archiveFeeds } from "../store/actions";
import { batch, Signal, signal } from "@preact/signals";
import { LoadingButton } from "@mui/lab";
import Icon from "@mdi/react";
import { mdiContentSave } from "@mdi/js";

const validNumber = (value: string, min: number, max: number, int: boolean) => {
  if (value.length === 0) {
    return false;
  }
  const num = int ? parseInt(value) : parseFloat(value);
  return num >= min && num <= max;
};

// local states
const pageSizeError = signal(false);
const currentRate = signal("");
const pageSize = signal(appState.settings.value.pageSize.toString());
const allRates = signal(appState.settings.value.playbackRates ?? []);
const archive = signal(appState.settings.value.archive);
const forceArchive = signal(appState.settings.value.forceArchive);
const confirmOnExternalLink = signal(appState.settings.value.confirmOnExternalLink);

// reset local states
const reset = () => {
  batch(() => {
    pageSize.value = appState.settings.value.pageSize.toString();
    allRates.value = appState.settings.value.playbackRates ?? [];
    archive.value = appState.settings.value.archive;
    forceArchive.value = appState.settings.value.forceArchive;
    confirmOnExternalLink.value = appState.settings.value.confirmOnExternalLink;
  });
};

function Item({ title, subtitle, children }: {
  title: string,
  subtitle?: any,
  children: any
}) {
  return (
    <Stack direction="row" className="w-full items-center">
      <ListItemText secondary={subtitle && <span>{subtitle}</span>}>
        {title}
      </ListItemText>
      <span className="grow min-w-2" />
      <span className="text-right">{children}</span>
    </Stack>
  );
}

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
        appState.settings.value = {
          ...appState.settings.value,
          pageSize: parseInt(pageSize.value),
          playbackRates: allRates.value.length > 0 ? allRates.value : undefined,
          archive: archive.value,
          forceArchive: forceArchive.value,
          confirmOnExternalLink: confirmOnExternalLink.value,
        };
        open.value = false;
      });
    }
  };

  return (
    <Dialog
      open={open.value}
      onClose={close}
      disableBackdropClick
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <div>
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              General
            </Typography>
            <Divider />
          </div>

          <Item
            title="Number of entries per page"
            subtitle="positive integer"
          >
            <TextField
              variant="standard"
              type="number"
              sx={{ maxWidth: "45px" }}
              error={pageSizeError.value}
              value={pageSize.value}
              onChange={(event: any) => {
                const value = event.target.value;
                pageSizeError.value = !validNumber(value, 1, Number.MAX_SAFE_INTEGER, true);
                pageSize.value = value;
              }}
            />
          </Item>

          <Item
            title="Playback Rates"
            subtitle={<>Set playback rates (0 to 5) for enclosures. <br /> (Press Enter to add number)</>}
          >
            <Autocomplete
              multiple
              freeSolo
              style={{ maxWidth: "220px" }}
              options={[]}
              value={allRates.value}
              onChange={(_e, val) => {
                allRates.value = val.filter(v => validNumber(v, 0, 5, false));
              }}
              inputValue={currentRate.value}
              onInputChange={(_e, val) => currentRate.value = val}
              renderInput={params => (
                <TextField {...params} variant="standard" />
              )}
            />
          </Item>

          <Item title="Archive resources" subtitle="download resources (e.g. images) and save them locally">
            <Checkbox
              checked={archive.value}
              onChange={(e: any) => archive.value = e.target.checked}
            />
          </Item>

          <Item
            title="Force Archiving"
            subtitle="force archiving entries even if content doesn't change"
          >
            <Checkbox
              checked={forceArchive.value}
              onChange={(e: any) => forceArchive.value = e.target.checked}
            />
          </Item>

          <Item
            title="Confirm on External Link"
            subtitle="confirm before opening external link"
          >
            <Checkbox
              checked={confirmOnExternalLink.value}
              onChange={(e: any) => confirmOnExternalLink.value = e.target.checked}
            />
          </Item>

          <div className="pt-4">
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              Database
            </Typography>
            <Divider />
          </div>

          <Item title="Database Operations">
            <LoadingButton
              loading={appState.status.loading.value}
              loadingPosition="start"
              color="primary" onClick={archiveFeeds}
              startIcon={<Icon path={mdiContentSave} size={1} />}
            >
              <Box sx={{ mt: 0.2 }}>Archive</Box>
            </LoadingButton>
          </Item>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={close}>Cancel</Button>
        <Button color="error" onClick={reset}>Reset</Button>
        <Button color="primary" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

