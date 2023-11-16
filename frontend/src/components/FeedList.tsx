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

import { Box, List, ListItemButton } from "@mui/material";
import { computedState, state } from "../store/state";
import { toFeedId } from "../store/feed";
import { updateQueryParams } from "../store/actions";

function FeedList() {
  const feeds = computedState.filteredFeeds.value;
  const entries = state.data.value.entries;

	return (
		<List sx={{ width: "100%" }}>
      <ListItemButton
        sx={{ p: 0.5, pl: 4 }}
        onClick={() => updateQueryParams({ feed: undefined })}
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
      </ListItemButton>
      {feeds.map(feed => {
        const feedId = toFeedId(feed);
        return (
          <ListItemButton
            key={feedId}
            sx={{ p: 0.5, pl: 4 }}
            onClick={() => updateQueryParams({ feed: feedId })}
          >
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
            <span>{feed.title}</span>
            <Box sx={{
              ml: 0.8,
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
	);
}

export default FeedList;
