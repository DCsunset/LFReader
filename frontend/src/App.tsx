import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { blue, green } from "@mui/material/colors";
import {
	createBrowserRouter,
	RouterProvider
} from "react-router-dom";
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import EntryListLayout from './components/EntryListLayout';

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
				// Entry list of a feed or a tag
				path: ":type/:item",
				element: <EntryListLayout />,
				children: [
					{
						// Optional params (without using another component)
						path: ":entry",
						element: null
					}
				]
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
