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

import { createSignal, For } from "solid-js";
import { dispatchFeedAction, FeedInfo } from "../state/actions";
import { IconButton, TextButton } from "./ui";
import PencilIcon from "lucide-solid/icons/pencil"
import PlusIcon from "lucide-solid/icons/plus"
import XIcon from "lucide-solid/icons/x"
import { setState, state } from "../state/store";
import { createEffect } from "solid-js";
import { concatClasses } from "../util/css";

export default function NewFeedDialog() {
  const [feeds, setFeeds] = createSignal<FeedInfo[]>([])
  const [errorMsg, setErrorMsg] = createSignal("")

  let ref!: HTMLDialogElement
  let inputRef!: HTMLInputElement

  async function updateFeed(feed: FeedInfo) {
    setFeeds(
      feeds().map(f => {
        if (f.url === feed.url) {
          // Must create a new object for reactivity
          const url = feed.new_url ? feed.new_url : f.url
          return {
            url,
            user_data: feed.user_data
          }
        }
        return f;
      })
    )
    return true;
  }

  function handleEdit(feed: FeedInfo) {
    setState("status", "feedDialog", {
      open: true,
      feed,
      onSave: updateFeed
    })
  }

  function handleRemove(feed: FeedInfo) {
    setFeeds(feeds().filter(f => f.url !== feed.url))
  }

  function handleAdd() {
    const url = inputRef.value
    const f = feeds()

    if (url.length === 0) {
      setErrorMsg("Empty feed url")
      return
    }

    if (f.findIndex(f => f.url === url) !== -1) {
      setErrorMsg("Feed url already added")
      return
    }

    setFeeds([
      ...f,
      { url, user_data: {} }
    ])
    inputRef.value = ""
  }

  function handleReset() {
    setFeeds([])
    inputRef.value = ""
  }

  function handleClose() {
    handleReset()
    setState("status", "newFeedDialog", "open", false)
  }

  async function handleSubmit() {
    const { archive, forceArchive } = state.settings;
    const success = await dispatchFeedAction({
      action: "fetch",
      archive,
      feeds: feeds(),
      force_archive: forceArchive,
    });
    if (success) {
      handleClose();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter") {
      return
    }

    event.preventDefault()
    handleAdd()
  }

  createEffect(() => {
    if (state.status.newFeedDialog.open) {
      ref?.showModal()
    } else {
      ref?.close()
    }
  })

  return (
    <dialog ref={ref} class="d-modal">
      <div class="d-modal-box max-h-[80dvh] flex flex-col p-0">
        <h4 class="px-6 pt-6 pb-4 text-xl font-medium">Add Feeds</h4>

        <div class="flex flex-col px-6 gap-3 overflow-y-scroll">
          {/* Current feeds */}
          <ol>
            <For each={feeds()}>
              {(f, _index) => (
                <li class="flex items-center gap-1">
                  <span class="overflow-x-scroll grow text-nowrap mr-3">{f.url}</span>
                  <IconButton class="d-btn-sm" title="Edit" onClick={() => handleEdit(f)}>
                    <PencilIcon class="size-[1.2rem]"/>
                  </IconButton>
                  <IconButton class="d-btn-sm" title="Remove" onClick={() => handleRemove(f)}>
                    <XIcon class="size-[1.2rem]"/>
                  </IconButton>
                </li>
              )}
            </For>
          </ol>

          <div class="flex items-top gap-5 py-3">
            <div class="grow">
              <input
                ref={inputRef}
                class={concatClasses([
                  "d-input",
                  "w-full",
                  { "d-input-error": errorMsg().length > 0 }
                ])}
                placeholder="Feed URL"
                onInput={() => setErrorMsg("")}
                onKeyDown={handleKeyDown}
              />
              <div class="mt-1 text-error text-sm">{errorMsg()}</div>
            </div>
            <IconButton title="Add feed" onClick={handleAdd}>
              <PlusIcon class="size-[1.45rem]" />
            </IconButton>
          </div>
        </div>

        <div class="px-4 py-2 flex justify-end">
          <TextButton onClick={handleClose}>Cancel</TextButton>
          <TextButton color="error" onClick={handleReset}>Reset</TextButton>
          <TextButton
            color="primary"
            onClick={handleSubmit}
            loading={state.status.loading}
            disabled={feeds().length === 0}
          >
            Submit
          </TextButton>
        </div>
      </div>
    </dialog>
  );
}

