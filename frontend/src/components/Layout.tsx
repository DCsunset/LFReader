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

import Menu from "lucide-solid/icons/menu"
import List from "lucide-solid/icons/list"
import { IconButton } from "./ui"

const appBarHeight = "44px"

function AppBar() {
  return (
    <div class="px-3 flex items-center bg-blue-600" style={{ height: appBarHeight }}>
      <IconButton class="pa-1 mr-2">
        <Menu />
      </IconButton>

      <h1 class="grow text-xl font-semibold">All</h1>

      <IconButton class="pa-1 mr-2">
        <List />
      </IconButton>
    </div>
  )
}

export default function Layout() {
  return (
    // <div class="dark">
    <div class="h-screen">
      <AppBar />

      <div style={{ height: `calc(100% - ${appBarHeight})` }}>
      </div>
    </div>
  )
}

