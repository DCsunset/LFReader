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

import { computed } from "@preact/signals";
import { Box, createTheme, CssBaseline, Divider, ThemeProvider, Typography } from "@mui/material";
import { Route, Router } from "preact-router";
import { useEffect } from "preact/hooks";
import Layout from './components/Layout';
import { computedState, state } from "./store/state";
import { toEntryId } from "./store/feed";
import Icon from "@mdi/react";
import { mdiCalendarMonth } from "@mdi/js";
import { displayDate } from "./utils/date";
import { grey } from "@mui/material/colors";
import hljs from "highlight.js";
import "highlight.js/styles/base16/tomorrow-night.css";

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

  // highligh code on update
  useEffect(() => {
    document.querySelectorAll("#lfreader-entry pre code").forEach((el: HTMLElement) => {
      hljs.highlightElement(el);
    });
    document.querySelectorAll("#lfreader-entry .highlight pre, #lfreader-entry code").forEach((el: HTMLElement) => {
      el.classList.add("hljs")
    });
    // open link in external page
    document.querySelectorAll("#lfreader-entry a").forEach((el: HTMLElement) => {
      el.setAttribute("target", "_blank");
    });
  });

  const entry = computedState.selectedEntry.value;

  return (
    <Layout>
      {entry &&
        <Box
          id="lfreader-entry"
          sx={{
            // prevent images from overflowing
            "& img": {
              maxWidth: "85%",
              // overwrite existing fixed width and height
              width: "auto",
              height: "auto"
            }
          }}
        >
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            {entry.title}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="info" sx={{ display: "flex" }}>
            <Icon path={mdiCalendarMonth} size={0.9} />
            <Box sx={{ ml: 0.5 }}>{displayDate(entry.published_at)}</Box>
          </Typography>

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

// Types for custom typography
declare module '@mui/material/styles' {
  interface TypographyVariants {
    info: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    info?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    info: true;
  }
}

const theme = computed(() => {
  const dark = state.settings.value.dark;
  return createTheme({
    palette: {
      mode: dark ? "dark" : "light"
    },
    typography: {
      info: {
        color: dark ? grey[400] : grey[600],
        fontWeight: 500
      }
    }
  });
});

function App() {
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
