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

import { Box, List, ListItemButton, Pagination, Stack } from "@mui/material";
import { computedState, state } from "../store/state";
import { toEntryId } from "../store/feed";
import { updateQueryParams } from "../store/actions";
import { computed } from "@preact/signals";

const numPages = computed(() => (
  Math.ceil(
    computedState.filteredEntries.value.length / state.settings.value.pageSize
  )
))

const displayedEntries = computed(() => {
  const page = computedState.page.value;
  const pageSize = state.settings.value.pageSize;
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
          return (
            <ListItemButton
              key={entryId}
              onClick={() => updateQueryParams({ entry: entryId })}
            >
              <Box sx={{
                fontStyle: e.title ? undefined : "italic",
                overflowWrap: "anywhere"
              }}>
                {e.title || "(No title)"}
              </Box>
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
