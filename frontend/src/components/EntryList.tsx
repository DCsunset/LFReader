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

import { Box, Divider, IconButton, List, ListItemButton, Pagination, Stack, TextField } from "@mui/material";
import { computedState, lookupFeed, appState } from "../store/state";
import { getFeedTitle, toEntryId } from "../store/feed";
import { updateQueryParams } from "../store/actions";
import { batch, computed, effect, signal } from "@preact/signals";
import { displayDateDiff } from "../utils/date";
import { mdiArrowLeft, mdiClose, mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { preventEventDefault } from "../utils/dom";

const selectedEntry = computedState.selectedEntry;
const selectedEntryId = computed(() => {
  const e = selectedEntry.value;
  return e && toEntryId(e);
});

const numPages = computed(() => (
  Math.ceil(
    computedState.filteredEntries.value.length / appState.settings.value.pageSize
  )
))

const searching = signal(false);
const entryTitleFilter = signal("");
const toolbar = computed(() => !searching.value);

function cancelSearch() {
  updateQueryParams({ entryTitleFilter: undefined });
}

function handleSearch() {
  const filter = entryTitleFilter.value;
  updateQueryParams({
    entryTitleFilter: filter.length > 0 ? filter : undefined
  });
}

function handleSearchKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    cancelSearch();
  }
  else if (event.key === "Enter") {
    handleSearch();
    event.preventDefault();
  }
}

effect(() => {
  const filter = appState.queryParams.value.entryTitleFilter || "";
  batch(() => {
    entryTitleFilter.value = filter;
    searching.value = Boolean(filter);
  });
});

function EntryList({ onClick }: {
  onClick: () => any
}) {
	return (
    <Stack direction="column" sx={{ height: "100%" }}>
      {toolbar.value &&
        <Stack direction="row" sx={{ px: 0.8 }}>
          <IconButton
            color="inherit"
            title="Search entries"
            onClick={() => searching.value = true}
          >
            <Icon path={mdiMagnify} size={1} />
          </IconButton>
        </Stack>
      }
      {searching.value &&
        <Stack direction="row" sx={{ px: 0.8, alignItems: "center" }}>
          <IconButton
            color="inherit"
            title="Cancel"
            onClick={cancelSearch}
          >
            <Icon path={mdiArrowLeft} size={1} />
          </IconButton>
          <TextField
            inputRef={input => input?.focus()}
            variant="standard"
            sx={{ flexGrow: 1 }}
            value={entryTitleFilter.value}
            onChange={(event: any) => {
              entryTitleFilter.value = event.target.value;
            }}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              endAdornment: (
                entryTitleFilter.value.length > 0 &&
                  <IconButton
                    size="small"
                    onClick={() => entryTitleFilter.value = ""}
                    onMouseDown={preventEventDefault}
                    edge="end"
                  >
                    <Icon path={mdiClose} size={0.9} />
                  </IconButton>
              )
            }}
          />
          <IconButton
            color="inherit"
            title="Search entries by title"
            onClick={handleSearch}
          >
            <Icon path={mdiMagnify} size={1} />
          </IconButton>
        </Stack>
      }
      <Divider />
      <List disablePadding sx={{ overflow: "auto", flexGrow: 1 }}>
        {computedState.displayedEntries.value.map(e => {
          const entryId = toEntryId(e);
          const feedTitle = getFeedTitle(lookupFeed(e.feed_url));

          return (
            <ListItemButton
              key={entryId}
              onClick={() => {
                onClick();
                updateQueryParams({ entry: entryId });
              }}
              sx={{
                flexDirection: "column",
                justifyContent: "flex-start",
                display: "block",
                py: 1.5
              }}
              selected={selectedEntryId.value === entryId}
            >
              <div className="text-sm inline-flex item center mb-1 opacity-80 font-medium w-full">
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
                  {displayDateDiff(e.published_at ?? e.updated_at ?? e.server_data.added_at)}
                </Box>
              </div>
              <div>{e.title || "(No Title)"}</div>
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
        page={computedState.currentPage.value}
        onChange={(_, v) => updateQueryParams({ page: v.toString() })}
      />
    </Stack>
	)
}

export default EntryList;
