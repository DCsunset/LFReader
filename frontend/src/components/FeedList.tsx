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

import { Box, IconButton, List, ListItem, ListItemButton } from "@mui/material";
import { computedState, state } from "../store/state";
import { Feed, toFeedId } from "../store/feed";
import { deleteFeed, updateQueryParams } from "../store/actions";
import { batch, computed, signal } from "@preact/signals";
import { mdiClose, mdiLeadPencil } from "@mdi/js";
import Icon from '@mdi/react';
import FeedDialog from "./FeedDialog";

const editing = state.ui.editingFeeds;
const FeedItemComponent = computed(() => editing.value ? ListItem : ListItemButton);
const feedDialog = {
  open: signal(false),
  feed: signal<Feed|null>(null)
};

function confirmDeletion(feed: Feed) {
  batch(() => {
    state.confirmation.open.value = true;
    state.confirmation.content.value = <>Confirm deletion of feed <b>{feed.title}</b>?</>;
    state.confirmation.onConfirm = () => {
      deleteFeed(feed.url);
    };
  });
}

function FeedList() {
  const feeds = computedState.filteredFeeds.value;
  const entries = state.data.value.entries;
  const FeedItem = FeedItemComponent.value;

	return (
    <>
      <List sx={{ width: "100%" }}>
        <FeedItem
          sx={{ p: 0.5, pl: 4 }}
          onClick={() => editing.value || updateQueryParams({}, true)}
        >
          <span>All</span>
          <Box sx={{
            ml: 0.8,
            mt: 0.1,
            fontSize: "0.85rem",
            display: "inline"
          }}>
            ({entries.length})
          </Box>
        </FeedItem>
        {feeds.map(feed => {
          const feedId = toFeedId(feed);
          return (
            <FeedItem
              key={feedId}
              sx={{ p: 1, pl: editing.value ? 1 : 4 }}
              onClick={() => editing.value || updateQueryParams({ feed: feedId }, true)}
            >
              {editing.value &&
                <Box sx={{ mr: 1.5 }}>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ p: 0.5 }}
                    onClick={() => confirmDeletion(feed)}
                  >
                    <Icon path={mdiClose} size={0.9} />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="inherit"
                    sx={{ p: 0.5 }}
                    onClick={() => {
                      feedDialog.feed.value = feed;
                      feedDialog.open.value = true;
                    }}
                  >
                    <Icon path={mdiLeadPencil} size={0.9} />
                  </IconButton>
                </Box>
              }
              {feed.icon &&
                <Box
                  component="img"
                  src={feed.icon}
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1
                  }}
                />
              }
              <span style={{ overflowWrap: "anywhere" }}>{feed.title}</span>
              <Box sx={{
                mx: 0.8,
                mt: 0.1,
                fontSize: "0.85rem",
                display: "inline"
              }}>
                ({entries.reduce((acc, e) => e.feed_url === feed.url ? acc+1 : acc, 0)})
              </Box>
            </FeedItem>
          );
        })}
      </List>

      <FeedDialog {...feedDialog} />
    </>
	);
}

export default FeedList;
