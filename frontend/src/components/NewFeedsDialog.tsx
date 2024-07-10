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

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, TextField } from "@mui/material"
import { Signal, signal, batch } from "@preact/signals";
import { fetchData } from "../store/actions";
import Icon from "@mdi/react";
import { mdiClose, mdiLeadPencil } from "@mdi/js";
import { Feed, FeedUserData } from "../store/feed";
import { appState } from "../store/state";
import { useCallback } from "preact/hooks";
import { preventEventDefault } from "../utils/dom";

// added feeds
const feeds = signal<Feed[]>([]);

// current unadded feed url
const feedUrl = signal("");
const feedUrlError = signal("");
const fetchDataInProgress = signal(false);

function setFeedUrl(value: string) {
  batch(() => {
    feedUrl.value = value;
    if (feedUrlError.value.length > 0 && value.length > 0) {
      feedUrlError.value = "";
    }
  });
}

function resetFeedUrl() {
  batch(() => {
    feedUrl.value = "";
    feedUrlError.value = "";
  });
}

function reset() {
  batch(() => {
    feedUrl.value = "";
    feedUrlError.value = "";
    feeds.value = [];
  });
}

function remove(feed: Feed) {
  feeds.value = feeds.value.filter(f => f.url !== feed.url);
}

async function update(feed: Feed, data: FeedUserData) {
  feeds.value = feeds.value.map(f => {
    if (f.url === feed.url) {
      f.user_data = data;
    }
    return f;
  })
  return true;
}

export default function NewFeedsDialog({ open }: {
  open: Signal<boolean>
}) {
  // reset local states
  const close = () => {
    batch(() => {
      open.value = false;
      feedUrl.value = "";
      feedUrlError.value = "";
      feeds.value = [];
    });
  };

  async function submit() {
    fetchDataInProgress.value = true;
    const success = await fetchData(feeds.value);
    if (success) {
      close();
    }
    fetchDataInProgress.value = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter") {
      return;
    }
    if (event.ctrlKey) {
      submit();
      return;
    }

    const url = feedUrl.value;
    if (feeds.value.findIndex(f => f.url === url) !== -1) {
      feedUrlError.value = "Feed url already added";
      return;
    }
    if (feedUrl.value.length === 0) {
      feedUrlError.value = "Empty feed url";
      return;
    }
    batch(() => {
      feeds.value = feeds.value.concat({
        url,
        user_data: {}
      });
      feedUrl.value = "";
    })
    event.preventDefault();
  }

  const handleClose = (_: Event, reason: string) => {
    if (reason === "backdropClick") {
      return;
    }
    close();
  };

  return (
    <Dialog
      open={open.value}
      onClose={handleClose}
      disableBackdropClick
    >
      <DialogTitle sx={{ pb: 0 }}>Add feeds</DialogTitle>
      <DialogContent>
        <List>
          {feeds.value.map(f => (
            <ListItem disablePadding sx={{ m: 1 }}>
              <ListItemText sx={{ overflow: "scroll" }}>
                {f.url}
              </ListItemText>
              <IconButton
                sx={{  }}
                onClick={() => {
                  batch(() => {
                    const { feedDialog } = appState;
                    feedDialog.open.value = true;
                    feedDialog.feed.value = f;
                    feedDialog.onSave = update;
                  });
                }}
              >
                <Icon path={mdiLeadPencil} size={0.9} />
              </IconButton>
              <IconButton
                onClick={() => remove(f)}
                onMouseDown={preventEventDefault}
              >
                <Icon path={mdiClose} size={0.9} />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <TextField
          inputRef={input => input?.focus()}
          sx={{ mt: 2, width: "100%", minWidth: "400px" }}
          label="Feed URL"
          error={feedUrlError.value.length > 0}
          helperText={feedUrlError.value || "Press Enter to add feed (C-Enter to submit)"}
          value={feedUrl.value}
          onChange={(event: any) => setFeedUrl(event.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              feedUrl.value.length > 0 &&
                <IconButton
                  size="small"
                  onClick={resetFeedUrl}
                  onMouseDown={preventEventDefault}
                  edge="end"
                >
                  <Icon path={mdiClose} size={0.9} />
                </IconButton>
            )
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={close}>Cancel</Button>
        <Button color="error" onClick={reset} onMouseDown={preventEventDefault}>Reset</Button>
        <Button
          color="primary"
          onClick={submit}
          disabled={feeds.value.length === 0 || fetchDataInProgress.value}
        >
          {fetchDataInProgress.value
            ? <CircularProgress color="inherit" size={20} />
            : <span>Submit</span>}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

