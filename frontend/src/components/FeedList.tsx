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
import { route } from "preact-router";
import { computedState } from "../store/state";
import { to_feed_id } from "../store/feed";

function FeedList() {
	// This component won't render If feeds is null
	return (
		<List sx={{ width: "100%" }}>
      {computedState.filteredFeeds.value.map(feed => {
        const feed_id = to_feed_id(feed);
        return (
          <ListItemButton
            key={feed_id}
            sx={{ p: 0.5, pl: 4 }}
            onClick={() => route(`/?feed=${feed_id}`)}
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
        );
      })}
		</List>
	);
}

export default FeedList;
