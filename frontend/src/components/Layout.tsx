// LFReader
// Copyright (C) 2022-2026  DCsunset

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
import InfoIcon from "lucide-solid/icons/info"
import CodeIcon from "lucide-solid/icons/code"
import SettingsIcon from "lucide-solid/icons/settings"
import MoonIcon from "lucide-solid/icons/moon"
import SunIcon from "lucide-solid/icons/sun"
import RssIcon from "lucide-solid/icons/rss"
import { batch, createMemo, createSignal } from "solid-js"
import FeedList from "./FeedList"
import { Show, JSX } from "solid-js"
import defaultTheme from "tailwindcss/defaultTheme"
import { createBreakpoints } from "@solid-primitives/media"
import { loadEntryContents } from "../state/actions"
import { Ctx, deriveCtx, SearchParams } from "../state/context"
import { useSearchParams } from "@solidjs/router"
import { IconButton } from "./ui"
import { getEntryTitle, getFeedTitle, tagTitle } from "../state/feed"
import { createEffect } from "solid-js"
import EntryList from "./EntryList"
import Entry from "./Entry"
import FeedDialog from "./FeedDialog"

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
        class={`h-full d-drawer-side ${props.class ?? ""}`}
        style={{
          width: props.modal ? undefined : "auto",
          ...props.style
        }}
      >
        <Show when={props.modal}>
          <div class="d-drawer-overlay" onClick={() => props.onChange(false)} />
        </Show>
        <div class={`h-full border-x-1 border-base-content/15 ${props.color ?? "bg-base-200"}`}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

function Toolbar() {
  return (
    <div class="flex flex-row-reverse gap-1 py-4 px-3">
      <IconButton
        class="d-btn-sm"
        title="Settings"
      >
        <SettingsIcon class="size-[1.45rem]" />
      </IconButton>
      <IconButton
        class="d-btn-sm"
        title="Theme"
      >
        <MoonIcon class="size-[1.45rem]" />
      </IconButton>
      <IconButton
        class="d-btn-sm"
        title="API"
      >
        <CodeIcon class="size-[1.45rem]" />
      </IconButton>
      <IconButton
        class="d-btn-sm"
        title="About"
      >
        <InfoIcon class="size-[1.45rem]" />
      </IconButton>
    </div>
  )
}


export default function Layout() {
  const breakpoints = createBreakpoints(defaultTheme.screens)
  const actualFeedListWidth = createMemo(() => breakpoints.sm && feedList() ? feedListWidth : "0")
  const actualEntryListWidth = createMemo(() => breakpoints.sm && entryList() ? entryListWidth : "0")
  const [searchParams, _setSearchParams] = useSearchParams<SearchParams>()
  const ctx = deriveCtx(searchParams)

  let entryListRef!: HTMLDivElement
  let entryRef!: HTMLDivElement

  const scrollEntryList = () => {
    entryListRef.scrollTo({ top: 0, behavior: "smooth" })
  };
  const scrollEntry = () => {
    entryRef.scrollTo({ top: 0, behavior: "smooth" })
  };

  // Update visibility of lists on screen size change
  createEffect(() => {
    const sm = breakpoints.sm
    batch(() => {
      setFeedList(sm)
      setEntryList(sm || !ctx.currentEntry())
    })
  })

  // scroll entry list to top on page update
  createEffect(() => {
    ctx.currentPage()
    entryListRef.scrollTo({ top: 0 })
  })

  // Scroll entry to top on entry change
  createEffect(() => {
    if (ctx.currentEntry()) {
      entryRef.scrollTo({ top: 0 });
    }
  });

  // Fetch content on page change
  createEffect(() => {
    let entries = ctx.displayedEntries()
    const current = ctx.currentEntry()
    // update current entry as well
    if (current && entries.findIndex(e => e.id === current.id && e.feed_url === current.feed_url) === -1) {
      entries = entries.concat(current)
    }
    loadEntryContents(entries)
  })

  const scroll = (e: MouseEvent) => {
    if (!breakpoints.sm) {
      // Pass it to children components
      e.preventDefault()
      return
    }

    if (entryList()) {
      scrollEntryList()
    } else {
      scrollEntry()
    }
  }

  return (
    <Ctx.Provider value={ctx}>
      <div class="h-dvh">
        {/* Feed drawer should be above entry drawer */}
        <Drawer
          open={feedList()}
          onChange={setFeedList}
          modal={!breakpoints.sm}
          class="z-2"
        >
          <div class="h-full flex flex-col">
            <div class="flex py-4 justify-center items-center">
              <RssIcon class="text-amber-500 mr-2" />
              <h1 class="text-xl font-semibold">
                LFReader
              </h1>
            </div>

            <FeedList
              class="menu"
              style={{ width: feedListWidth }}
            />

            <Toolbar />
          </div>
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

            <h1 class="grow text-xl font-semibold truncate select-none" onDblClick={scroll}>
              <span onDblClick={scrollEntryList}>
                {getFeedTitle(ctx.currentFeed(), tagTitle(searchParams.tag))}
              </span>
              {ctx.currentEntry() &&
                <>
                  <span class="mx-2">|</span>
                  <span onDblClick={scrollEntry}>
                    {getEntryTitle(ctx.currentEntry())}
                  </span>
                </>
              }
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
            style={{
              height: `calc(100dvh - ${appBarHeight})`,
            }}
          >
            <EntryList
              ref={entryListRef}
              class="h-full"
              style={{ width: breakpoints.sm ? entryListWidth : "100dvw" }}
            />
          </Drawer>

          <div
            ref={entryRef}
            class="transition-[margin-left] duration-300 ease-[ease-out] py-8 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-y-scroll"
            style={{
              height: `calc(100% - ${appBarHeight})`,
              "margin-left": actualEntryListWidth(),
            }}
          >
            <Entry />
          </div>
        </main>

        <FeedDialog />
      </div>
    </Ctx.Provider>
  )
}

