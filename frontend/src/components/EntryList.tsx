// LFReader
// Copyright (C) 2022-2025  DCsunset
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import ListTodoIcon from "lucide-solid/icons/list-todo"
import SearchIcon from "lucide-solid/icons/search"
import ArrowLeftIcon from "lucide-solid/icons/arrow-left"
import XIcon from "lucide-solid/icons/x"
import ArrowDownAZIcon from "lucide-solid/icons/arrow-down-a-z"
import ArrowDownZAIcon from "lucide-solid/icons/arrow-down-z-a"
import SquareCheckIcon from "lucide-solid/icons/square-check"
import CopyCheckIcon from "lucide-solid/icons/copy-check"
import MailWarningIcon from "lucide-solid/icons/mail-warning"
import MailOpenIcon from "lucide-solid/icons/mail-open"
import ChevronLeftIcon from "lucide-solid/icons/chevron-left"
import ChevronFirstIcon from "lucide-solid/icons/chevron-first"
import ChevronRightIcon from "lucide-solid/icons/chevron-right"
import ChevronLastIcon from "lucide-solid/icons/chevron-last"
import { createMemo, For } from "solid-js"
import { IconButton } from "./ui"
import { createStore, produce } from "solid-js/store"
import * as immutable from "immutable"
import { derivedState, setState, state } from "../state/store"
import { Dynamic } from "solid-js/web"
import { useContext } from "solid-js"
import { Ctx, SearchParams } from "../state/context"
import { getEntryDate, getFeedTitle, toEntryId } from "../state/feed"
import { displayDateDiff } from "../util/date"
import { Show } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import { dispatchEntryAction, EntryInfo } from "../state/actions"
import { Match } from "solid-js"
import { Switch } from "solid-js"
import { splitProps } from "solid-js"


const [toolbarState, setToolbarState] = createStore({
  mode: null as null | "search" | "select",
  selectedEntries: immutable.Set<string>(),
  searchString: "",
})

/// Mark entries as read/unread
async function markEntries(selected: immutable.Set<string>, read: boolean) {
  // update user_data locally for responsiveness
  setState("data", "entries", e => selected.has(toEntryId(e)), "user_data", "read", read)
  await dispatchEntryAction({
    action: "update",
    entries: selected.toJS()
      .map(e => derivedState.entryIdMap().get(e))
      .map(e => e && ({
        feed_url: e.feed_url,
        entry_id: e.id,
        user_data: {
          ...e.user_data,
          read,
        },
      } as EntryInfo))
      .filter(e => e !== undefined),
  })
}


function Toolbar() {
  let searchInputRef!: HTMLInputElement

  const ctx = useContext(Ctx)!
  const selectedEntriesStatus = createMemo(() => {
    // Find if any is read or unread
    let status = { read: false, unread: false }
    for (const e of toolbarState.selectedEntries) {
      const read = Boolean(derivedState.entryIdMap().get(e)!.user_data.read)
      status.read ||= read
      status.unread ||= !read
    }
    return status
  })

  return (
    <div class="px-2.5 py-1">
      <Switch>
        {/* Base mode */}
        <Match when={toolbarState.mode === null}>
          <div class="flex">
            <IconButton
              class="d-btn-sm"
              onClick={() => setToolbarState(produce(v => {
                const current = ctx.currentEntry()
                v.mode = "select"
                v.selectedEntries = immutable.Set(current && [ toEntryId(current) ])
              }))}
            >
              <ListTodoIcon size={22} />
            </IconButton>
            <div class="d-dropdown">
              <IconButton tabindex={0} class="d-btn-sm">
                <Dynamic component={state.ui.entrySortDesc ? ArrowDownZAIcon : ArrowDownAZIcon} size={22} />
              </IconButton>
              <div
                tabindex={0}
                class="d-dropdown-content px-5 pt-1 pb-4 bg-base-200 border border-base-content/20"
              >
                <fieldset
                  class="d-fieldset text-base mb-1"
                  onChange={e => setState("ui", "entrySortBy", (e.target as HTMLInputElement).value as any)}
                >
                  <legend class="d-fieldset-legend">Sort by</legend>
                  <label class="d-label text-base-content">
                    <input
                      type="radio"
                      name="sortBy"
                      value="date"
                      checked={state.ui.entrySortBy === "date"}
                      class="d-radio d-radio-sm d-radio-info"
                    />
                    Date
                  </label>
                  <label class="d-label text-base-content">
                    <input
                      type="radio"
                      name="sortBy"
                      value="unread"
                      checked={state.ui.entrySortBy === "unread"}
                      class="d-radio d-radio-sm d-radio-info"
                    />
                    Unread
                  </label>
                </fieldset>

                <fieldset class="d-fieldset text-base">
                  <legend class="d-fieldset-legend">Sort order</legend>
                  <label class="d-label text-base-content">
                    <input
                      type="checkbox"
                      class="d-checkbox d-checkbox-sm d-checkbox-info"
                      checked={state.ui.entrySortDesc}
                    />
                    Descend
                  </label>
                </fieldset>
              </div>
            </div>
            <IconButton
              class="d-btn-sm"
              onClick={() => {
                setToolbarState("mode", "search")
                searchInputRef.focus()
              }}
            >
              <SearchIcon size={22} />
            </IconButton>
          </div>
        </Match>

        {/* Select mode */}
        <Match when={toolbarState.mode === "select"}>
          <div>
            <div class="flex items-center">
              <IconButton
                class="d-btn-sm"
                title="Cancel"
                onClick={() => setToolbarState("mode", null)}
              >
                <ArrowLeftIcon size={22} />
              </IconButton>
              <span class="pl-2 grow font-bold">
                {toolbarState.selectedEntries.size} selected
              </span>

              <IconButton
                class="d-btn-sm"
                title="Clear selection"
                onClick={() => setToolbarState("selectedEntries", immutable.Set())}
              >
                <XIcon size={22} />
              </IconButton>
              <IconButton
                class="d-btn-sm"
                title="Select page"
                onClick={() => setToolbarState("selectedEntries", v => v.union(ctx.displayedEntries().map(toEntryId)))}
              >
                <SquareCheckIcon size={22} />
              </IconButton>
              <IconButton
                class="d-btn-sm"
                title="Select all"
                onClick={() => setToolbarState("selectedEntries", v => v.union(ctx.filteredEntries().map(toEntryId)))}
              >
                <CopyCheckIcon size={22} />
              </IconButton>
            </div>

            <div class="flex flex-row-reverse items-center">
              <IconButton
                class={`d-btn-sm ${selectedEntriesStatus().unread ? "" : "d-btn-disabled"}`}
                title="Mark as read"
                onClick={() => markEntries(toolbarState.selectedEntries, true)}
                disabled={!selectedEntriesStatus().unread}
              >
                <MailOpenIcon size={22} />
              </IconButton>
              <IconButton
                class={`d-btn-sm ${selectedEntriesStatus().read ? "" : "d-btn-disabled"}`}
                title="Mark as unread"
                onClick={() => markEntries(toolbarState.selectedEntries, false)}
              >
                <MailWarningIcon size={22} />
              </IconButton>
            </div>
          </div>
        </Match>

        {/* Search mode */}
        <Match when={toolbarState.mode === "search"}>
          <div class="flex items-center">
            <IconButton
              class="d-btn-sm"
              title="Cancel"
              onClick={() => setToolbarState(produce(v => {
                v.mode = null
                v.searchString = ""
              }))}
            >
              <ArrowLeftIcon size={22} />
            </IconButton>
            <label class="d-input h-[2rem] text-[0.9rem] mx-1.5 pr-1.5">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search title"
                value={toolbarState.searchString}
                onChange={e => setToolbarState("searchString", e.target.value)}
              />
              <IconButton
                class="d-btn-sm"
                title="Clear input"
                onClick={() => {
                  setToolbarState("searchString", "")
                  searchInputRef.focus()
                }}
              >
                <XIcon size={22} />
              </IconButton>
            </label>
          </div>
        </Match>
      </Switch>
    </div>
  )
}

export default function EntryList(props: any) {
  const ctx = useContext(Ctx)!
  const [localProps, restProps] = splitProps(props, [ "class" ])
  const [_searchParams, setSearchParams] = useSearchParams<SearchParams>()
  const maxPageNum = createMemo(() => Math.ceil(ctx.filteredEntries().length / state.settings.pageSize))

  const isSelected = (entryId: string) => {
    if (toolbarState.mode === "select") {
      return toolbarState.selectedEntries.has(entryId)
    } else {
      const current = ctx.currentEntry()
      return current ? toEntryId(current) === entryId : false
    }
  }

  const selectEntry = (entryId: string) => {
    if (toolbarState.mode === "select") {
      const selected = toolbarState.selectedEntries
      setToolbarState(
        "selectedEntries",
        selected.has(entryId)
          ? selected.delete(entryId)
          : selected.add(entryId)
      )
    } else {
      markEntries(immutable.Set([entryId]), true)
      setSearchParams({ entry: entryId })
    }
  }

  return (
    // Must use flex to prevent list from increasing height instead of overflowing
    <div class={`flex flex-col ${localProps.class ?? ""}`} {...restProps}>
      <Toolbar />

      <div class="d-divider m-0 h-0" />

      <ol class="overflow-auto">
        <For each={ctx.displayedEntries()}>
          {(e, _index) => {
            const entryId = toEntryId(e)
            const feedTitle = getFeedTitle(derivedState.feedMap().get(e.feed_url))

            return (
              <li
                class={`hover:bg-base-content/15 cursor-pointer px-4 py-3 ${isSelected(entryId) ? "bg-blue-300/25" : ""}`}
                onClick={() => selectEntry(entryId)}
              >
                <div class="text-sm flex items-center mb-1 font-semibold w-full">
                  <Show when={!e.user_data.read}>
                    <span class="h-2 w-2 mr-2 bg-base-content rounded-full" title="Unread" />
                  </Show>
                  <span class="grow whitespace-nowrap overflow-hidden text-ellipsis opacity-80">
                    {feedTitle}
                  </span>
                  <span class="ml-1 opacity-80">
                    {displayDateDiff(getEntryDate(e))}
                  </span>
                </div>
                <div>{e.title || "(No Title)"}</div>
              </li>
            )
          }}
        </For>
      </ol>

      <div class="d-divider m-0 h-0" />

      <div class="flex px-3 py-2 justify-center font-semibold items-center">
        <IconButton
          class="d-btn-sm"
          onClick={() => setSearchParams({ page: null })}
        >
          <ChevronFirstIcon size={22} />
        </IconButton>
        <IconButton
          class="d-btn-sm"
          onClick={() => setSearchParams({
            page: Math.max(ctx.currentPage() - 1, 1).toString(),
          })}
        >
          <ChevronLeftIcon size={22} />
        </IconButton>

        <div class="flex items-center gap-1.5 px-4">
          <input
            type="number"
            required
            class="w-[3rem] d-input user-invalid:d-validator text-base text-center bg-transparent"
            style={{ appearance: "textfield" }}
            value={ctx.currentPage()}
            onChange={e => {
              if (e.target.validity.valid) {
                const page = e.target.value
                setSearchParams({ page: page === "1" ? null : page })
              }
            }}
            min={1}
            max={maxPageNum()}
          />
          <span>/</span>
          <span>{maxPageNum()}</span>
        </div>

        <IconButton
          class="d-btn-sm"
          onClick={() => setSearchParams({
            page: Math.min(ctx.currentPage() + 1, maxPageNum()).toString(),
          })}
        >
          <ChevronRightIcon size={22} />
        </IconButton>
        <IconButton
          class="d-btn-sm"
          onClick={() => setSearchParams({ page: maxPageNum().toString() })}
        >
          <ChevronLastIcon size={22} />
        </IconButton>
      </div>
    </div>
  )
}
