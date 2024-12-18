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

import { Box, Collapse, IconButton, List, ListItemButton } from "@mui/material";
import { computedState, appState } from "../store/state";
import { filterEntries, filterFeeds, getFeedTitle, tagTitle, toFeedId } from "../store/feed";
import { updateFeed, updateQueryParams } from "../store/actions";
import { batch, computed, useComputed } from "@preact/signals";
import { mdiChevronRight, mdiLeadPencil } from "@mdi/js";
import Icon from '@mdi/react';

const selectedFeed = computedState.selectedFeed;
const editing = appState.ui.editingFeeds;
const feedGroupStates = appState.ui.feedGroupStates;

const tagId = (tag?: string) => tag ?? "_all";

function FeedGroup({ tag, onClick }: {
  // undefined means all, _none means without tag
  tag?: string,
  onClick: () => any
}) {
  const feeds = useComputed(() => filterFeeds(appState.data.feeds.value, { tag }));
  const entries = useComputed(() => filterEntries(appState.data.entries.value, { feeds: feeds.value }));
  const visible = useComputed(() => feedGroupStates.value[tagId(tag)] ?? (tag !== "_none"));

  return (
    <>
      <ListItemButton
        sx={{ p: 1 }}
        onClick={() => {
          onClick();
          updateQueryParams({ feed: undefined, tag }, true);
        }}
        selected={appState.queryParams.value.tag === tag}
      >
        <Box sx={{ mr: 0.5 }}>
          <IconButton
            color="inherit"
            sx={{ p: 0.5 }}
            onClick={e => {
              feedGroupStates.value = {
                ...feedGroupStates.value,
                [tagId(tag)]: !visible.value
              },
              e.stopPropagation();
            }}
          >
            <Icon
              path={mdiChevronRight}
              style={{
                transform: `rotate(${visible.value ? "90deg" : "0"})`,
                transition: "all 0.2s"
              }}
              size={0.9}
            />
          </IconButton>
        </Box>

        <div className="grow font-semibold">{tagTitle(tag)}</div>
        <Box className="font-semibold" sx={{
          mx: 0.8,
          mt: 0.1,
          fontSize: "0.85rem",
          display: "inline"
        }}>
          ({entries.value.length})
        </Box>
      </ListItemButton>
      <Collapse in={visible.value}>
        {feeds.value.map(feed => {
          const feedId = toFeedId(feed);
          return (
            <ListItemButton
              key={feedId}
              sx={{ p: 1, pl: editing.value ? 1.3 : 6 }}
              selected={selectedFeed.value === feed}
              onClick={() => {
                onClick();
                updateQueryParams({ feed: feedId, tag: undefined }, true);
              }}
            >
              {editing.value &&
                <Box sx={{ mr: 1 }}>
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
                ({entries.value.reduce((acc, e) => e.feed_url === feed.url ? acc+1 : acc, 0)})
              </Box>
            </ListItemButton>
          );
        })}
      </Collapse>
    </>
  );
}

function FeedList({ onClick }: {
  onClick: () => any
}) {
  const tags = computed(() => computedState.feedTags.value.concat([ undefined, "_none" ]));

	return (
    <>
      <List sx={{ width: "100%" }}>
        {tags.value.map(tag => <FeedGroup tag={tag} onClick={onClick} />)}
      </List>
    </>
	);
}

export default FeedList;
