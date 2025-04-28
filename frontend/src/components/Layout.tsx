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

import MenuIcon from "lucide-solid/icons/menu"
import ListIcon from "lucide-solid/icons/list"
import { createMemo, createSignal } from "solid-js"
import FeedList from "./FeedList"
import { Show, JSX } from "solid-js"
import defaultTheme from "tailwindcss/defaultTheme"
import { createBreakpoints } from "@solid-primitives/media"

const appBarHeight = "44px"
const feedListWidth = "250px";
const entryListWidth = "350px";

const [feedList, setFeedList] = createSignal(false)
const [entryList, setEntryList] = createSignal(false)

function Drawer(props: {
  open: boolean,
  onChange: (_: boolean) => void,
  children: any,
  modal: boolean,
  style?: JSX.CSSProperties,
}) {
  return (
    <div class="d-drawer">
      <input
        type="checkbox"
        class="d-drawer-toggle"
        checked={props.open}
        onChange={e => props.onChange(e.currentTarget.checked)}
      />
      <div
        class="d-drawer-side"
        style={{
          width: props.modal ? undefined : "auto",
          ...props.style
        }}
      >
        <Show when={props.modal}>
          <div class="d-drawer-overlay" onClick={() => props.onChange(false)} />
        </Show>
        {props.children}
      </div>
    </div>
  )
}

export default function Layout() {
  const breakpoints = createBreakpoints(defaultTheme.screens)
  const actualFeedListWidth = createMemo(() => breakpoints.sm && feedList() ? feedListWidth : "0")
  const actualEntryListWidth = createMemo(() => breakpoints.sm && entryList() ? entryListWidth : "0")

  return (
    // <div class="dark">
    <div class="h-dvh">
      <Drawer open={feedList()} onChange={setFeedList} modal={!breakpoints.sm}>
        <FeedList
          class="text-base-content h-full menu bg-base-200"
          style={{ width: feedListWidth }}
        />
      </Drawer>

      <Drawer
        open={entryList()}
        onChange={setEntryList}
        modal={false}
        style={{
          left: actualFeedListWidth(),
          top: appBarHeight,
        }}
      >
        <div
          class="text-base-content h-full menu bg-base-200"
          style={{ width: breakpoints.sm ? entryListWidth : "100dvw" }}
        >
          Test
        </div>
      </Drawer>

      {/* Apply same transition as the drawer */}
      <main
        class="h-full transition-[margin] duration-300 ease-[ease-out]"
        style={{ "margin-left": actualFeedListWidth() }}
      >
        <div class="d-navbar bg-primary min-h-0 px-3" style={{ height: appBarHeight }}>
          <button
            class="pa-1 mr-2 d-btn d-btn-ghost d-btn-circle d-btn-sm hover:bg-white/15 border-none"
            onClick={() => setFeedList(!feedList())}
          >
            <MenuIcon />
          </button>

          <h1 class="grow text-xl font-semibold">All</h1>

          <button
            class="pa-1 d-btn d-btn-ghost d-btn-circle d-btn-sm hover:bg-white/15 border-none"
            onClick={() => setEntryList(!entryList())}
          >
            <ListIcon />
          </button>
        </div>

        <div
          class="transition-[margin-left] duration-300 ease-[ease-out]"
          style={{
            height: `calc(100% - ${appBarHeight})`,
            "margin-left": actualEntryListWidth(),
          }}
        >
          <div>Hello</div>
        </div>
      </main>
    </div>
  )
}

