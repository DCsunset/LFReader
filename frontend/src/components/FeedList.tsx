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
import { Base64 } from "js-base64";
import { route } from "preact-router";
import { computed, signal } from "@preact/signals";
import { state } from "../store/state";

const feeds = computed(() => {
  const excludedTags = state.ui.excludedTags.value;
  return state.feeds.value.filter(feed => {
    for (const t of feed.user_data?.tags ?? []) {
      if (excludedTags.includes(t)) {
        return false;
      }
    }
    return true;
  });
});

function FeedList() {
	// This component won't render If feeds is null
	return (
		<List sx={{ width: "100%" }}>
      {feeds.value.map(feed => (
        <ListItemButton
          key={feed.url}
          sx={{ p: 0.5, pl: 4 }}
          onClick={() => route(
            `/?feed=${Base64.encode(feed.url, true)}`
          )}
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
          {feed.title}
        </ListItemButton>
      ))}
		</List>
	);
}

export default FeedList;
