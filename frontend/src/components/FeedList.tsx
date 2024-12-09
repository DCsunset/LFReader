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

import { Box, IconButton, List, ListItemButton } from "@mui/material";
import { computedState, appState } from "../store/state";
import { getFeedTitle, toFeedId } from "../store/feed";
import { updateFeed, updateQueryParams } from "../store/actions";
import { batch } from "@preact/signals";
import { mdiLeadPencil } from "@mdi/js";
import Icon from '@mdi/react';

const selectedFeed = computedState.selectedFeed;
const editing = appState.ui.editingFeeds;

function FeedList({ onClick }: {
  onClick: () => any
}) {
  const feeds = computedState.filteredFeeds.value;
  const entries = appState.data.entries.value;

	return (
    <>
      <List sx={{ width: "100%" }}>
        <ListItemButton
          sx={{ p: 1, pl: editing.value ? 6 : 4 }}
          onClick={() => {
            onClick();
            updateQueryParams({}, true);
          }}
          selected={!selectedFeed.value}
        >
          <Box sx={{ flexGrow: 1 }}>All</Box>
          <Box sx={{
            mx: 0.8,
            mt: 0.1,
            fontSize: "0.85rem",
            display: "inline"
          }}>
            ({entries.length})
          </Box>
        </ListItemButton>
        {feeds.map(feed => {
          const feedId = toFeedId(feed);
          return (
            <ListItemButton
              key={feedId}
              sx={{ p: 1, pl: editing.value ? 1 : 4 }}
              selected={selectedFeed.value === feed}
              onClick={() => {
                onClick();
                updateQueryParams({ feed: feedId }, true);
              }}
            >
              {editing.value &&
                <Box sx={{ mr: 1.5 }}>
                  <IconButton
                    size="small"
                    color="inherit"
                    sx={{ p: 0.5 }}
                    onClick={e => {
                      batch(() => {
                        const { feedDialog } = appState;
                        feedDialog.open.value = true;
                        feedDialog.feed.value = feed;
                        feedDialog.onSave = updateFeed;
                      });
                      e.stopPropagation();
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
              <Box sx={{
                overflowWrap: "anywhere",
                mr: 0.8,
                flexGrow: 1
              }}>
                {getFeedTitle(feed)}
              </Box>
              <Box sx={{
                mx: 0.8,
                mt: 0.1,
                fontSize: "0.85rem",
                display: "inline"
              }}>
                ({entries.reduce((acc, e) => e.feed_url === feed.url ? acc+1 : acc, 0)})
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </>
	);
}

export default FeedList;
