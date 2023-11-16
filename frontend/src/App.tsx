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

import { computed, useComputed } from "@preact/signals";
import { Box, createTheme, CssBaseline, Divider, ThemeProvider, Typography } from "@mui/material";
import { Route, Router } from "preact-router";
import Layout from './components/Layout';
import { computedState, state } from "./store/state";
import { useEffect } from "preact/hooks";
import { toEntryId } from "./store/feed";

interface PageProps {
  // query paramters (from preact-router)
  matches: {
    feed_tag?: string,
    feed?: string,
    entry?: string
  },
};

const currentContents = computed(() => {
  const entry = computedState.selectedEntry.value;
  return entry?.contents || (entry?.summary ? [entry?.summary] : []);
});
const currentEntryId = computed(() => {
  return toEntryId(computedState.selectedEntry.value);
})

function Page(props: PageProps) {
  useEffect(() => {
    state.queryParams.value = props.matches;
  }, [props.matches]);
  const entry = computedState.selectedEntry.value;

  return (
    <Layout>
      {entry &&
        <Box sx={{
          // prevent images from overflowing
          "& img": { maxWidth: "85%" }
        }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            {entry.title}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {currentContents.value.map((v, i) => (
            // If it's text/plain, content is not sanitized
            v.type === "text/plain" ?
              <div>{v.value}</div> :
              <div
                key={`${currentEntryId.value} ${i}`}
                dangerouslySetInnerHTML={{ __html: v.value }}
              />
          ))}
        </Box>}
    </Layout>
  )
}

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
