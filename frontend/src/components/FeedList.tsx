// LFReader
// Copyright (C) 2025  DCsunset

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

import { For } from "solid-js"
import ChevronRightIcon from "lucide-solid/icons/chevron-right"
import { derivedState, setState, state } from "../state/store"
import { IconButton }from "./ui"
import { createMemo } from "solid-js"
import { filterFeeds, getFeedTitle, toFeedId } from "../state/feed"
import { useSearchParams } from "@solidjs/router"
import { SearchParams } from "../state/context"

function FeedGroup(props: {
  // _all means all feeds, _none means without tag
  tag?: string
}) {
  const tagId = () => props.tag ?? "_all"
  const open = createMemo(() => state.ui.feedGroup[tagId()] ?? (props.tag !== "_none"))
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>()
  const feeds = createMemo(() => filterFeeds(state.data.feeds, { tag: props.tag }))

  const name = () => {
    switch (props.tag) {
      case undefined:
        return "All"
      case "_none":
        return "Untagged"
      default:
        return props.tag
    }
  }
  const isPresetTag = () => {
    return props.tag === undefined || props.tag.startsWith("_")
  }

  return (
    <li class="d-collapse rounded-none">
      <input class="hidden" type="checkbox" checked={open()} />

      <div
        class={`d-collapse-title flex items-center px-2 py-1.5 min-h-0 hover:bg-white/15 font-bold ${searchParams.tag === props.tag ? "bg-blue-300/25" : ""}`}
        onClick={() => setSearchParams({
          tag: props.tag,
          feed: undefined,
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
          {name()}
        </span>
      </div>
      <ul class="d-collapse-content p-0!">
        <For each={feeds()}>
          {(feed, _index) => {
            const feedId = toFeedId(feed)
            return (
              <div
                class={`hover:bg-white/15 cursor-pointer pl-11 p-2 ${searchParams.feed === feedId ? "bg-blue-300/25" : ""}`}
                onClick={() => setSearchParams({
                  tag: undefined,
                  feed: feedId,
                } as SearchParams)}
              >
                {getFeedTitle(feed)}
              </div>
            )
          }}
        </For>
      </ul>
    </li>
  )
}

export default function FeedList(props: any) {
  const tags = () => [ undefined, ...derivedState.feedTags(), "_none" ]
  return (
    <ul {...props}>
      <For each={tags()}>
        {(tag, _index) => (
          <FeedGroup tag={tag} />
        )}
      </For>
    </ul>
  )
}

