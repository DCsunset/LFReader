/* @refresh reload */
import { render } from 'solid-js/web'
import 'virtual:uno.css'
import "@fontsource/open-sans/300.css"
import "@fontsource/open-sans/400.css"
import "@fontsource/open-sans/500.css"
import "@fontsource/open-sans/600.css"
import "@fontsource/open-sans/700.css"

import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')

render(() => <App />, root!)
