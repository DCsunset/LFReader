// LFReader
// Copyright (C) 2022-2024  DCsunset

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
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery, useTheme } from "@mui/material";
import { Route, Router } from "preact-router";
import { useEffect } from "preact/hooks";
import Layout from './components/Layout';
import { grey } from "@mui/material/colors";
import { appState } from "./store/state";
import { parseRawQueryParams } from "./store/actions";

// update query paramters (from preact-router)
function Page(props: { matches: any }) {
  const theme = useTheme()
  const smallDevice = useMediaQuery(theme.breakpoints.down("sm"))

  // Convert hook to signal
  useEffect(() => {
    appState.ui.smallDevice.value = smallDevice
  }, [smallDevice])

  useEffect(() => {
    appState.queryParams.value = parseRawQueryParams(props.matches)
  }, [props.matches])

  return (
    <Layout />
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
  const dark = appState.settings.value.dark;
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
