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

import { Box, List, ListItemButton, SxProps, Typography } from "@mui/material";
import { computedState, state } from "../store/state";
import { toEntryId } from "../store/feed";
import { updateQueryParams } from "../store/actions";

function EntryList() {
	return (
		<List sx={{
			overflow: "auto",
			height: "100%",
		}}>
			{computedState.filteredEntries.value.map(e => {
        const entryId = toEntryId(e);
        return (
				  <ListItemButton
					  key={entryId}
					  onClick={() => updateQueryParams({ entry: entryId })}
				  >
            <Box sx={{
              fontStyle: e.title ? undefined : "italic"
            }}>
              {e.title || "(No title)"}
            </Box>
				  </ListItemButton>
        )
			})}
		</List>
	)
}

export default EntryList;
