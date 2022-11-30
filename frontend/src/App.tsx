import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { blue, green } from "@mui/material/colors";
import {
	createBrowserRouter,
	RouterProvider
} from "react-router-dom";
import Layout from './components/Layout';

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
				// Entry list of a feed or a tag
				path: ":type/:item",
				// Optional params (without using another component)
				element: null,
				children: [
					{
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
