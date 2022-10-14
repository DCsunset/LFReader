import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { blue, green } from "@mui/material/colors";
import {
	createBrowserRouter,
	RouterProvider
} from "react-router-dom";
import './App.css'
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import EntryList from './components/EntryList';
import { Children } from "react";

const theme = createTheme({
	typography: {
		fontFamily: [
			"Open Sans",
			"sans-serif"
		].join(",")
	},
	palette: {
		mode: "dark",
		primary: {
			main: blue[500],
			contrastText: "#fff"
		},
		secondary: {
			main: green[500],
			contrastText: "#fff"
		},
	}
});

const router = createBrowserRouter([
	{
		// Layout
		path: "/",
		element: <Layout />,
		children: [
			{
				// Home
				// index means the same route as parent
				index: true,
				element: <HomePage />
			},
			{
				// Entry list of a feed
				path: ":type/:title",
				element: <EntryList />
			},
		]
	}
]);

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />

			<RouterProvider router={router} />
		</ThemeProvider>
	)
}

export default App;
