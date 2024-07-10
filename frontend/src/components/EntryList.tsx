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

import { Box, List, ListItemButton, Pagination, Stack, Typography } from "@mui/material";
import { computedState, lookupFeed, appState } from "../store/state";
import { getFeedTitle, toEntryId } from "../store/feed";
import { updateQueryParams } from "../store/actions";
import { computed } from "@preact/signals";
// import Icon from "@mdi/react";
// import { mdiCircle } from "@mdi/js";
import { displayDateDiff } from "../utils/date";

const selectedEntry = computedState.selectedEntry;

const numPages = computed(() => (
  Math.ceil(
    computedState.filteredEntries.value.length / appState.settings.value.pageSize
  )
))

const displayedEntries = computed(() => {
  const page = computedState.page.value;
  const pageSize = appState.settings.value.pageSize;
  return computedState.filteredEntries.value.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
})

function EntryList() {
	return (
    <Stack direction="column" sx={{ height: "100%" }}>
      <List sx={{ overflow: "auto", flexGrow: 1 }}>
        {displayedEntries.value.map(e => {
          const entryId = toEntryId(e);
          const feedTitle = getFeedTitle(lookupFeed(e.feed_url));

          return (
            <ListItemButton
              key={entryId}
              onClick={() => updateQueryParams({ entry: entryId })}
              sx={{
                flexDirection: "column",
                justifyContent: "flex-start",
                display: "block",
                py: 1.5
              }}
              selected={selectedEntry.value === e}
            >
              <Typography variant="body2" sx={{
                display: "inline-flex",
                alignItems: "center",
                mb: 0.5,
                opacity: 0.8,
                fontWeight: 500,
                width: "100%"
              }}>
                {/* TODO: Used for unread entries
                <Box sx={{ mr: 1 }}>
                  <Icon path={mdiCircle} size={0.4} />
                </Box>
                  */}
                <Box sx={{
                  flexGrow: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  mr: 1
                }}>
                  {feedTitle}
                </Box>
                <Box>
                  {displayDateDiff(e.published_at ?? e.updated_at)}
                </Box>
              </Typography>
              <Box>{e.title || "(No Title)"}</Box>
            </ListItemButton>
          )
        })}
      </List>
      <Pagination
        size="large"
        sx={{
          margin: "auto", // center pagination
          my: 1.4
        }}
        count={numPages.value}
        siblingCount={0}
        page={computedState.page.value}
        onChange={(_, v) => updateQueryParams({ page: v.toString() })}
      />
    </Stack>
	)
}

export default EntryList;
