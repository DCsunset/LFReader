// LFReader
// Copyright (C) 2022-2025  DCsunset

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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { batch, computed, effect, signal } from "@preact/signals";
import { textCategories, FeedUserData, getFeedTitle } from "../store/feed";
import { dispatchFeedAction, handleExternalLink } from "../store/actions";
import Icon from "@mdi/react";
import { mdiBroom, mdiContentSave, mdiDelete, mdiDownload, mdiOpenInNew } from "@mdi/js";
import { LoadingButton } from "@mui/lab";
import { appState, computedState, lookupFeed } from "../store/state";
import Item from "./SettingsItem";

// local states
const alias = signal("");
const tags = signal([] as string[]);
const baseUrl = signal("");
const afterDate = signal("");
const playbackRate = signal("");
const archiveBlacklist = signal("");
const archiveSequential = signal(false);
const archiveInterval = signal("");
const archiveIntervalError = signal(false);
const frozen = signal(false)

const { loading } = appState.ui;
const { open, feed } = appState.feedDialog;
const existing = computed(() => Boolean(lookupFeed(feed.value?.url)));
const title = computed(() => getFeedTitle(feed.value));
const categories = computed(() => textCategories(feed.value?.categories));

const close = () => {
  open.value = false;
};
// reset local states
const reset = () => {
  // subscribe to feed
  const f = feed.value;
  batch(() => {
    alias.value = f?.user_data.alias ?? "";
    tags.value = f?.user_data.tags ?? [];
    baseUrl.value = f?.user_data.base_url ?? "";
    afterDate.value = f?.user_data.after_date ?? "";
    playbackRate.value = f?.user_data.playback_rate ?? "";
    archiveBlacklist.value = f?.user_data.archive_blacklist ?? "";
    archiveSequential.value = f?.user_data.archive_sequential ?? false;
    archiveInterval.value = f?.user_data.archive_interval?.toString() ?? "";
    archiveIntervalError.value = false;
    frozen.value = f?.user_data.frozen ?? false
  });
};
const save = async () => {
  // No need to update the feed signal as no UI depends on user_data
  const userData: FeedUserData = {
    ...(feed.value?.user_data || {}),
    alias: alias.value || undefined,
    tags: tags.value.length > 0 ? tags.value : undefined,
    base_url: baseUrl.value || undefined,
    after_date: afterDate.value || undefined,
    playback_rate: playbackRate.value || undefined,
    archive_blacklist: archiveBlacklist.value || undefined,
    archive_sequential: archiveSequential.value || undefined,
    archive_interval: (archiveInterval.value && parseFloat(archiveInterval.value)) || undefined,
    frozen: frozen.value || undefined,
  };
  const f = feed.value!;
  // Must load onSave here to keep it up to date
  const ok = await appState.feedDialog.onSave?.({
    url: f.url,
    user_data: userData
  });
  if (ok) {
    close();
  }
};

async function handleArchive() {
  if (feed.value) {
    await dispatchFeedAction({
      action: "archive",
      feed_urls: [feed.value.url]
    });
  }
}

async function handleFetch() {
  if (feed.value) {
    await dispatchFeedAction({
      action: "fetch",
      feeds: [feed.value]
    });
  }
}

function handleDelete() {
  batch(() => {
    appState.confirmation.open.value = true;
    appState.confirmation.content.value = <>Confirm deletion of feed <em>{title}</em>?</>;
    appState.confirmation.onConfirm = async () => {
      if (feed.value) {
        await dispatchFeedAction({
          action: "delete",
          feed_urls: [feed.value.url]
        });
        close();
      }
    };
  });
}

function handleClean() {
  batch(() => {
    appState.confirmation.open.value = true;
    appState.confirmation.content.value = <>Confirm to remove entries before <strong>{feed.value?.user_data.after_date}</strong> for <em>{title}</em>?</>;
    appState.confirmation.onConfirm = async () => {
      if (feed.value) {
        await dispatchFeedAction({
          action: "clean",
          feed_urls: [feed.value.url]
        });
        close();
      }
    };
  });
}


// Reset local states when feed changes
effect(reset);

export default function FeedDialog() {
  return (
    <Dialog
      open={open.value}
      onClose={close}
      disableBackdropClick
      fullWidth
    >
      <DialogTitle>
        Feed Settings for <em>{title}</em>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <div>
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              General
            </Typography>
            <Divider />
          </div>

          <Item title="URL">
            <IconButton
              color="inherit"
              target="_blank"
              href={feed.value?.url}
              onClick={handleExternalLink}
            >
              <Icon path={mdiOpenInNew} size={1} />
            </IconButton>
          </Item>

          {feed.value?.link &&
            <Item title="Home Page">
              <a
                href={feed.value?.link}
                target="_blank"
                onClick={handleExternalLink}
              >
                {title}
              </a>
            </Item>
          }

          {existing.value &&
            <>
              {feed.value?.subtitle &&
                <Item title="Description">
                  <div className="max-w-80 opacity-75">
                    {feed.value?.subtitle}
                  </div>
                </Item>}

              {categories.value.length > 0 &&
                <Item title="Categories">
                  <div className="max-w-80 opacity-80">
                    {categories.value.map(c => (
                      <Chip className="ma-0.8" size="small" key={c} label={c} />
                    ))}
                  </div>
                </Item>}

              {feed.value?.generator &&
                <Item title="Generator">
                  <div className="max-w-80 opacity-75">
                    {feed.value?.generator}
                  </div>
                </Item>}

              <Item title="Operations">
                <LoadingButton
                  loading={loading.value}
                  loadingPosition="start"
                  color="primary"
                  onClick={handleArchive}
                  startIcon={<Icon path={mdiContentSave} size={1} />}
                >
                  <Box sx={{ mt: 0.2 }}>Archive</Box>
                </LoadingButton>
                <LoadingButton
                  loading={loading.value}
                  loadingPosition="start"
                  color="success"
                  onClick={handleFetch}
                  startIcon={<Icon path={mdiDownload} size={1} />}
                >
                  <Box sx={{ mt: 0.2 }}>Fetch</Box>
                </LoadingButton>
                <LoadingButton
                  title="Remove entries before _AfterDate_"
                  disabled={!feed.value?.user_data.after_date}
                  loading={loading.value}
                  loadingPosition="start"
                  color="secondary"
                  onClick={handleClean}
                  startIcon={<Icon path={mdiBroom} size={1} />}
                >
                  <Box sx={{ mt: 0.2 }}>Clean</Box>
                </LoadingButton>
                <LoadingButton
                  loading={loading.value}
                  loadingPosition="start"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<Icon path={mdiDelete} size={1} />}
                >
                  <Box sx={{ mt: 0.2 }}>Delete</Box>
                </LoadingButton>
              </Item>
            </>
          }


          <div className="pt-4">
            <Typography color="textSecondary" sx={{ mb: 0.5 }}>
              User Data
            </Typography>
            <Divider />
          </div>

          <Item title="Alias" subtitle="an alias for feed title">
            <TextField
              variant="standard"
              value={alias.value}
              placeholder={title.value}
              onChange={(event: any) => {
                alias.value = event.target.value;
              }}
            />
          </Item>

          <Item
            title="Tags"
            subtitle={<>Set tags for this feed. <br /> (Type and press Enter to add new tag)</>}
          >
            <Autocomplete
              sx={{
                width: {
                  sm: "200px"
                },
                minWidth: {
                  xs: tags.value.length > 0 ? undefined : "80px"
                }
              }}
              multiple
              freeSolo
              options={computedState.feedTags.value}
              value={tags.value}
              onChange={(_e, val) => tags.value = val}
              renderInput={params =>
                <TextField {...params} variant="standard" />
              }
            />
          </Item>

          <Item
            title="Resource Base URL"
            subtitle="used for archiving resources"
          >
            <TextField
              variant="standard"
              value={baseUrl.value}
              placeholder="(auto)"
              onChange={(event: any) => {
                baseUrl.value = event.target.value;
              }}
            />
          </Item>

          <Item
            title="After Date"
            subtitle={<>only fetch entries after a date (ISO format) <br /> used by <strong>Clean</strong> to remove old entries</>}
          >
            <TextField
              variant="standard"
              value={afterDate.value}
              placeholder="(none)"
              onChange={(event: any) => {
                afterDate.value = event.target.value;
              }}
            />
          </Item>

          <Item
            title="Playback Rate"
            subtitle="default playback rate for media in enclosures"
          >
            <TextField
              variant="standard"
              value={playbackRate.value}
              placeholder="(unchanged)"
              onChange={(event: any) => {
                playbackRate.value = event.target.value;
              }}
            />
          </Item>

          <Item
            subtitle="url regex to blacklist when archiving"
            title="Archive Blacklist"
          >
            <TextField
              variant="standard"
              value={archiveBlacklist.value}
              placeholder="(none)"
              onChange={(event: any) => {
                archiveBlacklist.value = event.target.value;
              }}
            />
          </Item>

          <Item
            title="Archive Sequentially"
            subtitle="archive resources sequentially instead of concurrently"
          >
            <Checkbox
              checked={archiveSequential.value}
              onChange={(e: any) => archiveSequential.value = e.target.checked}
            />
          </Item>

          <Item
            title="Archive Interval"
            subtitle="only applied when archiving sequentially (in seconds)"
          >
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
          </Item>

          <Item
            title="Freeze Feed"
            subtitle="no longer update the feed from source"
          >
            <Checkbox
              checked={frozen.value}
              onChange={(e: any) => frozen.value = e.target.checked}
            />
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

