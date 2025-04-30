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
import RssIcon from "lucide-solid/icons/rss"
import RotateCwIcon from "lucide-solid/icons/rotate-cw"
import CloudDownloadIcon from "lucide-solid/icons/cloud-download"
import PlusIcon from "lucide-solid/icons/plus"
import PencilIcon from "lucide-solid/icons/pencil"
import { createMemo, createSignal, splitProps } from "solid-js"
import FeedList from "./FeedList"
import { Show, JSX } from "solid-js"
import defaultTheme from "tailwindcss/defaultTheme"
import { createBreakpoints } from "@solid-primitives/media"
import { setState, state } from "../state/store"
import { fetchFeeds, loadData } from "../state/actions"
import { Ctx, deriveCtx } from "../state/context"
import { useSearchParams } from "@solidjs/router"
import { IconButton } from "./ui"

const appBarHeight = "44px"
const feedListWidth = "250px";
const entryListWidth = "350px";

const [feedList, setFeedList] = createSignal(false)
const [entryList, setEntryList] = createSignal(false)
const [addFeedsDialog, setAddFeedsDialog] = createSignal(false)

function Drawer(props: {
  open: boolean,
  onChange: (_: boolean) => void,
  children: any,
  modal: boolean,
  style?: JSX.CSSProperties,
  class?: string,
  color?: string,
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
        class={`d-drawer-side ${props.class ?? ""}`}
        style={{
          width: props.modal ? undefined : "auto",
          ...props.style
        }}
      >
        <Show when={props.modal}>
          <div class="d-drawer-overlay" onClick={() => props.onChange(false)} />
        </Show>
        <div class={`h-full border-x-1 border-white/15 ${props.color ?? ""}`}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [ loadingData, setLoadingData ]= createSignal(false)
  const breakpoints = createBreakpoints(defaultTheme.screens)
  const actualFeedListWidth = createMemo(() => breakpoints.sm && feedList() ? feedListWidth : "0")
  const actualEntryListWidth = createMemo(() => breakpoints.sm && entryList() ? entryListWidth : "0")
  const [searchParams, _setSearchParams] = useSearchParams()
  const ctx = deriveCtx(searchParams)

  const handleLoadData = async () => {
    setLoadingData(true);
    await loadData();
    setLoadingData(false);
  }

  return (
    <Ctx.Provider value={ctx}>
      <div class="h-dvh">
        {/* Feed drawer should be above entry drawer */}
        <Drawer
          open={feedList()}
          onChange={setFeedList}
          modal={!breakpoints.sm}
          color="bg-base-200"
          class="z-2"
        >
          <div class="flex my-4 justify-center items-center">
            <RssIcon class="text-amber-500 mr-2" />
            <h5 class="text-xl font-semibold">
              LFReader
            </h5>
          </div>

          <div class="flex flex-row-reverse gap-0.5 m-3">
            <IconButton
              class="d-btn-sm"
              title="Loading feeds from server"
              onClick={handleLoadData}
              disabled={loadingData()}
            >
              {loadingData()
                ? <span class="d-loading d-loading-spinner" />
                : <RotateCwIcon size={22} />
              }
            </IconButton>
            <IconButton
              class={`d-btn-sm ${state.status.fetching ? "d-btn-disabled" : ""}`}
              title="Fetch feeds from origin"
              onClick={fetchFeeds}
            >
              {state.status.fetching
                ? <span class="d-loading d-loading-spinner" />
                : <CloudDownloadIcon size={22} />
              }
            </IconButton>
            <IconButton
              class="d-btn-sm"
              title="Add feeds"
              onClick={() => setAddFeedsDialog(true)}
            >
              <PlusIcon size={22} />
            </IconButton>
            <IconButton
              class={`d-btn-sm ${state.status.editingFeeds ? "text-secondary" : ""}`}
              title="Edit feeds"
              onClick={() => setState("status", "editingFeeds", v => !v)}
            >
              <PencilIcon size={22} />
            </IconButton>
          </div>

          <FeedList
            class="menu"
            style={{ width: feedListWidth }}
          />
        </Drawer>

        {/* Apply same transition as the drawer */}
        <main
          class="h-full transition-[margin] duration-300 ease-[ease-out]"
          style={{ "margin-left": actualFeedListWidth() }}
        >
          <div class="d-navbar bg-primary min-h-0 px-3" style={{ height: appBarHeight }}>
            <IconButton
              class="pa-1 mr-2 d-btn-sm"
              onClick={() => setFeedList(!feedList())}
            >
              <MenuIcon />
            </IconButton>

            <h1 class="grow text-xl font-semibold">
              All
            </h1>

            <IconButton
              class="pa-1 d-btn-sm"
              onClick={() => setEntryList(!entryList())}
            >
              <ListIcon />
            </IconButton>
          </div>

          {/* Entry list is positioned relative to the main */}
          <Drawer
            open={entryList()}
            onChange={setEntryList}
            modal={false}
            class="absolute"
            color="bg-base-300"
            style={{
              height: `calc(100dvh - ${appBarHeight})`,
            }}
          >
            <div style={{ width: breakpoints.sm ? entryListWidth : "100dvw" }}>
               Test
            </div>
          </Drawer>

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
    </Ctx.Provider>
  )
}

