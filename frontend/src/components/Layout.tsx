// LFReader
// Copyright (C) 2022-2025  DCsunset

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

import MenuIcon from "lucide-solid/icons/menu"
import ListIcon from "lucide-solid/icons/list"
import { createSignal } from "solid-js"
import FeedList from "./FeedList"

const appBarHeight = "44px"
const feedListWidth = "250px";
const entryListWidth = "350px";

const [feedList, setFeedList] = createSignal(false)
const [entryList, setEntryList] = createSignal(false)

function AppBar() {
  return (
    <div class=" px-3 flex items-center bg-primary" style={{ height: appBarHeight }}>
      <label for="feed-list" class="pa-1 mr-2 d-btn d-btn-ghost d-btn-circle d-btn-sm hover:bg-white/15 border-none">
        <MenuIcon />
      </label>

      <h1 class="grow text-xl font-semibold">All</h1>

      <label for="entry-list" class="pa-1 mr-2 d-btn d-btn-ghost d-btn-circle d-btn-sm hover:bg-white/15 border-none">
        <ListIcon />
      </label>
    </div>
  )
}

export default function Layout() {
  return (
    // <div class="dark">
    <div class="h-screen">
      <AppBar />

      <div class="d-drawer">
        <input id="feed-list" type="checkbox" class="d-drawer-toggle" />
        <div class="d-drawer-side">
          <label for="feed-list" aria-label="close sidebar" class="d-drawer-overlay" />
          <FeedList
            class="text-base-content h-full menu bg-base-200"
            style={{ width: feedListWidth }}
          />
        </div>
      </div>

      <div style={{ height: `calc(100% - ${appBarHeight})` }}>
        <div>Hello</div>
      </div>
    </div>
  )
}

