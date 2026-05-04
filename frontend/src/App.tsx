// LFReader
// Copyright (C) 2022-2025  DCsunset
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Router, Route } from "@solidjs/router"
import Layout from './components/Layout'
import { checkUpdate } from "./state/actions"
import { createEffect, onMount, onCleanup } from "solid-js"
import { state } from "./state/store"

function App() {
  // Fetch status and data on init
  onMount(checkUpdate)

  createEffect(() => {
    const theme = state.settings.dark ? "dark" : "light"
    document.documentElement.setAttribute("data-theme", theme)
  })

  createEffect(() => {
    // Periodically fetch updates
    let interval = state.settings.reloadInterval
    if (interval > 0) {
      let id = setInterval(checkUpdate, interval * 1000)
      onCleanup(() => clearInterval(id))
    }
  })

  // Use router for query parameters
	return (
    <Router>
      <Route path="/" component={Layout} />
    </Router>
  )
}

export default App;
