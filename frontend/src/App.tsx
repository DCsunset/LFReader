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

import { useComputed } from "@preact/signals";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Router } from "preact-router";
import Layout from './components/Layout';
import { state } from "./store/state";
import { useEffect } from "preact/hooks";
import { getFeeds } from "./store/actions";

interface PageProps {
  // query paramters (from preact-router)
  matches: {
    feed_tag?: string,
    feed?: string,
    entry?: string
  },
};

function Page(props: PageProps) {
  useEffect(() => {
    state.queryParams.value = props.matches;
  }, [props.matches]);
  return (
    <Layout>
      Test
    </Layout>
  )
}

// get feeds on startup
getFeeds();

function App() {
  const theme = useComputed(() => {
    const dark = state.settings.value.dark;
    return createTheme({
      palette: {
        mode: dark ? "dark" : "light"
      },
    });
  });

	return (
    <ThemeProvider theme={theme.value}>
      <CssBaseline />
      <Router>
        <Route default component={Page} />
      </Router>
    </ThemeProvider>
  )
}

export default App;
