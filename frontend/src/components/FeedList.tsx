// LFReader
// Copyright (C) 2025-2026  DCsunset

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

import { For, splitProps } from "solid-js"
import ChevronRightIcon from "lucide-solid/icons/chevron-right"
import RotateCwIcon from "lucide-solid/icons/rotate-cw"
import CloudDownloadIcon from "lucide-solid/icons/cloud-download"
import PlusIcon from "lucide-solid/icons/plus"
import PencilIcon from "lucide-solid/icons/pencil"
import { derivedState, setState, state } from "../state/store"
import { IconButton }from "./ui"
import { createMemo } from "solid-js"
import { filterFeeds, getFeedTitle, tagTitle, toFeedId } from "../state/feed"
import { useSearchParams } from "@solidjs/router"
import { SearchParams } from "../state/context"
import { dispatchFeedAction, FeedInfo, fetchFeeds, loadData } from "../state/actions"
import { createStore } from "solid-js/store"
import { Show } from "solid-js"
import { concatClasses } from "../util/css"

async function updateFeed(feed: FeedInfo) {
  return await dispatchFeedAction({
    action: "update",
    feeds: [feed],
  })
}

const [toolbarState, setToolbarState] = createStore({
  editing: false,
  loading: false,
})

function Toolbar() {
  const handleLoadData = async () => {
    setToolbarState("loading", true)
    await loadData();
    setToolbarState("loading", false)
  }

  return (
    <div class="flex flex-row-reverse gap-1 p-3">
      <IconButton
        class="d-btn-sm"
        title="Loading feeds from server"
        onClick={handleLoadData}
        disabled={toolbarState.loading}
      >
        {toolbarState.loading
          ? <span class="d-loading d-loading-spinner" />
          : <RotateCwIcon class="size-[1.45rem]" />
        }
      </IconButton>
      <IconButton
        class={`d-btn-sm ${state.status.loading ? "d-btn-disabled" : ""}`}
        title="Fetch feeds from origin"
        onClick={fetchFeeds}
      >
        {state.status.loading
          ? <span class="d-loading d-loading-spinner" />
          : <CloudDownloadIcon class="size-[1.45rem]" />
        }
      </IconButton>
      <IconButton
        class="d-btn-sm"
        title="Add feeds"
        onClick={() => setState("status", "newFeedDialog", "open", true)}
      >
        <PlusIcon class="size-[1.45rem]" />
      </IconButton>
      <IconButton
        class={concatClasses([
          "d-btn-sm",
          { "text-secondary": toolbarState.editing }
        ])}
        title="Edit feeds"
        onClick={() => setToolbarState("editing", v => !v)}
      >
        <PencilIcon class="size-[1.45rem]" />
      </IconButton>
    </div>
  )
}

function FeedGroup(props: {
  // _all means all feeds, _none means without tag
  tag?: string
}) {
  const tagId = () => props.tag ?? "_all"
  const open = createMemo(() => state.ui.feedGroup[tagId()] ?? (props.tag !== "_none"))
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>()
  const feeds = createMemo(() => filterFeeds(state.data.feeds, { tag: props.tag }))

  const isPresetTag = () => {
    return props.tag === undefined || props.tag.startsWith("_")
  }

  return (
    <li class="d-collapse rounded-none">
      <input class="hidden" type="checkbox" checked={open()} />

      <div
        class={concatClasses([
          "d-collapse-title",
          "flex",
          "items-center",
          "px-2",
          "py-1.5",
          "min-h-0",
          "hover:bg-base-content/15",
          "font-bold",
          {
            "bg-blue-300/25": searchParams.tag === props.tag
          }
        ])}
        onClick={() => setSearchParams({
          tag: props.tag,
          feed: undefined,
          page: undefined,
        } as SearchParams)}
      >
        <IconButton
          class="d-btn-sm mr-1"
          onClick={(e: any) => {
            setState("ui", "feedGroup", tagId(), !open())
            e.stopPropagation()
          }}
        >
          <ChevronRightIcon
            class={`transition-transform ${open() ? "rotate-90" : ""}`}
            size={20}
          />
        </IconButton>
        <span class={`${isPresetTag() ? "opacity-80" : ""}`}>
          {tagTitle(props.tag)}
        </span>
      </div>
      <ul class="d-collapse-content p-0!">
        <For each={feeds()}>
          {(feed, _index) => {
            const feedId = toFeedId(feed)
            return (
              <li
                class={
                  concatClasses([
                    "flex",
                    "items-center",
                    "hover:bg-base-content/15",
                    "cursor-pointer",
                    "p-2",
                    {
                      "bg-blue-300/25": searchParams.feed === feedId,
                      "pl-10": !toolbarState.editing,
                    }
                  ])
                }
                onClick={() => setSearchParams({
                  tag: undefined,
                  feed: feedId,
                  page: undefined,
                } as SearchParams)}
              >
                <span class="flex items-center">
                  <Show when={toolbarState.editing}>
                    <IconButton
                      class="d-btn-xs mr-1.5 ml-0.5"
                      title="Edit"
                      onClick={(e: Event) => {
                        setState("status", "feedDialog", {
                          open: true,
                          feed,
                          onSave: updateFeed,
                        })
                        e.stopPropagation()
                      }}
                    >
                      <PencilIcon class="size-[1.2rem]" />
                    </IconButton>
                  </Show>
                </span>
                <span class="flex">
                  {getFeedTitle(feed)}
                </span>
              </li>
            )
          }}
        </For>
      </ul>
    </li>
  )
}

export default function FeedList(props: any) {
  const [localProps, restProps] = splitProps(props, [ "class" ])
  const tags = () => [ undefined, ...derivedState.feedTags(), "_none" ]

  return (
    // Parent must have overflow-y-auto to make flex child scrollable
    <div class={`flex flex-col overflow-y-auto ${localProps.class}`} {...restProps}>
      <Toolbar />

      <ul class="overflow-y-scroll">
        <For each={tags()}>
          {(tag, _index) => (
            <FeedGroup tag={tag} />
          )}
        </For>
      </ul>
    </div>
  )
}

