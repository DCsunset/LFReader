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

import { createEffect, createMemo, createSignal, For } from "solid-js"
import { Feed, FeedUserData, getFeedTitle, textCategories } from "../state/feed"
import { derivedState, setState, state } from "../state/store"
import SettingsItem from "./SettingsItem"
import { IconButton, TextButton } from "./ui"
import { dispatchFeedAction, handleExternalLink } from "../state/actions"
import ExternalLinkIcon from "lucide-solid/icons/external-link"
import SaveIcon from "lucide-solid/icons/save"
import DownloadIcon from "lucide-solid/icons/download"
import BrushCleaningIcon from "lucide-solid/icons/brush-cleaning"
import TrashIcon from "lucide-solid/icons/trash"
import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { batch } from "solid-js"

async function handleArchive(url?: string) {
  if (!url) return

  await dispatchFeedAction({
    action: "archive",
    feed_urls: [url]
  });
}

async function handleFetch(feed?: Feed) {
  if (!feed) return

  await dispatchFeedAction({
    action: "fetch",
    feeds: [feed]
  });
}

function handleDelete(feed?: Feed) {
  if (!feed) return

  setState("status", "confirmDialog", {
    open: true,
    content: <>Confirm deletion of feed <em>{getFeedTitle(feed)}</em>?</>,
    onConfirm: async () => {
      await dispatchFeedAction({
        action: "delete",
        feed_urls: [feed.url]
      });
      setState("status", "feedDialog", "open", false)
    }
  })
}

const handleClose = () => setState("status", "feedDialog", "open", false)

function handleClean(feed?: Feed) {
  if (!feed) return

  setState("status", "confirmDialog", {
    open: true,
    content: <>Confirm to remove entries before <strong>{feed.user_data.after_date}</strong> for <em>{getFeedTitle(feed)}</em>?</>,
    onConfirm: async () => {
      await dispatchFeedAction({
        action: "clean",
        feed_urls: [feed.url]
      });
      setState("status", "feedDialog", "open", false)
    }
  })
}

export default function FeedDialog() {
  const feed = () => state.status.feedDialog.feed
  const feedLink = () => feed()?.link
  const feedUrl = () => feed()?.url
  const title = createMemo(() => getFeedTitle(feed()))
  const categories = createMemo(() => textCategories(feed()?.categories))
  const existing = createMemo(() => Boolean(feedUrl() && derivedState.feedMap().get(feedUrl()!)))
  const loading = () => state.status.loading

  let ref!: HTMLDialogElement
  let aliasRef!: HTMLInputElement
  let baseUrlRef!: HTMLInputElement
  let afterDateRef!: HTMLInputElement
  let playbackRateRef!: HTMLInputElement
  let archiveBlacklistRef!: HTMLInputElement
  let archiveIntervalRef!: HTMLInputElement
  let freezeFeedRef!: HTMLInputElement

  // reactive values
  const [archiveSequential, setArchiveSequential] = createSignal(false)
  const [tags, setTags] = createSignal([] as string[])

  const tagSelectOptions = createMemo(() => createOptions(
    derivedState.feedTags,
    {
      createable: true,
      // de-duplicate
      disable: v => tags().includes(v),
    }
  ))

  async function handleSave() {
    const f = feed()
    if (!f) return

    const archiveInterval = archiveIntervalRef.value
    const t = tags()

    const userData: FeedUserData = {
      ...(f?.user_data || {}),
      alias: aliasRef.value || undefined,
      tags: t.length > 0 ? t : undefined,
      base_url: baseUrlRef.value || undefined,
      after_date: afterDateRef.value || undefined,
      playback_rate: playbackRateRef.value || undefined,
      archive_blacklist: archiveBlacklistRef.value || undefined,
      archive_sequential: archiveSequential() || undefined,
      archive_interval: (archiveInterval && parseFloat(archiveIntervalRef.value)) || undefined,
      frozen: freezeFeedRef.checked || undefined,
    }

    if (await state.status.feedDialog.onSave?.({
      url: f.url,
      user_data: userData,
    })) {
      handleClose()
    }
  }

  function handleReset() {
    const f = feed()
    if (!f) return

    const d = f.user_data
    batch(() => {
      aliasRef.value = d.alias ?? ""
      setTags(d.tags ?? [])
      baseUrlRef.value = d.base_url ?? ""
      afterDateRef.value = d.after_date ?? ""
      playbackRateRef.value = d.playback_rate ?? ""
      archiveBlacklistRef.value = d.archive_blacklist ?? ""
      setArchiveSequential(d.archive_sequential ?? false)
      archiveIntervalRef.value = d.archive_interval?.toString() ?? ""
      freezeFeedRef.checked = d.frozen ?? false
    })
  }

  createEffect(() => {
    if (state.status.feedDialog.open) {
      ref?.showModal()
    } else {
      ref?.close()
    }
  })

  // Reset local states whenever feed changes
  createEffect(handleReset)

  return (
    <dialog ref={ref} class="d-modal">
      <div class="d-modal-box max-h-[80dvh] flex flex-col p-0">
        <h4 class="px-6 pt-6 pb-4 text-xl font-medium">Feed Settings for <em>{title()}</em></h4>

        <div class="flex flex-col px-6 gap-3 overflow-y-scroll">
          <div>
            <h6 class="font-semibold opacity-70">General</h6>
            <div class="d-divider m-0" />
          </div>

          <SettingsItem title="URL">
            <IconButton
              class="d-btn-sm"
              title="Open"
              onClick={handleExternalLink}
            >
              <ExternalLinkIcon class="size-[1.3rem]" />
            </IconButton>
          </SettingsItem>

          {feedLink() &&
            <SettingsItem title="Home Page">
              <a
                href={feedLink()}
                target="_blank"
                class="opacity-75"
                onClick={handleExternalLink}
              >
                {title()}
              </a>
            </SettingsItem>
          }

          {existing() &&
            <>
              {feed()?.subtitle &&
                <SettingsItem title="Description">
                  <div class="max-w-80 opacity-75">
                    {feed()?.subtitle}
                  </div>
                </SettingsItem>}

              {categories().length > 0 &&
                <SettingsItem title="Categories">
                  <div class="max-w-80 opacity-80">
                    <For each={categories()}>
                      {(c, _index) => (
                        <span class="d-badge d-badge-soft bg-base-content/15!">
                          {c}
                        </span>
                      )}
                    </For>
                  </div>
                </SettingsItem>}

              {feed()?.generator &&
                <SettingsItem title="Generator">
                  <div class="max-w-80 opacity-75">
                    {feed()?.generator}
                  </div>
                </SettingsItem>}

              <SettingsItem title="Operations">
                <TextButton class="d-btn-sm text-sm px-2" color="primary" onClick={() => handleArchive(feedUrl())}>
                  {loading()
                    ? <span class="loading loading-spinner loading-sm" />
                    : (
                      <span class="flex items-center">
                        <SaveIcon class="size-[1.3rem] mr-1" />
                        Archive
                      </span>
                    )
                  }
                </TextButton>

                <TextButton class="d-btn-sm text-sm px-2" color="success" onClick={() => handleFetch(feed())}>
                  {loading()
                    ? <span class="loading loading-spinner loading-sm" />
                    : (
                      <span class="flex items-center">
                        <DownloadIcon class="size-[1.3rem] mr-1" />
                        Fetch
                      </span>
                    )
                  }
                </TextButton>

                <TextButton class="d-btn-sm text-sm px-2" color="secondary" onClick={() => handleClean(feed())}>
                  {loading()
                    ? <span class="loading loading-spinner loading-sm" />
                    : (
                      <span class="flex items-center">
                        <BrushCleaningIcon class="size-[1.3rem] mr-1" />
                        Clean
                      </span>
                    )
                  }
                </TextButton>

                <TextButton class="d-btn-sm text-sm px-2" color="error" onClick={() => handleDelete(feed())}>
                  {loading()
                    ? <span class="loading loading-spinner loading-sm" />
                    : (
                      <span class="flex items-center">
                        <TrashIcon class="size-[1.3rem] mr-1" />
                        Delete
                      </span>
                    )
                  }
                </TextButton>
              </SettingsItem>
            </>
          }

          <div class="mt-4">
            <h6 class="font-semibold opacity-70">User Data</h6>
            <div class="d-divider m-0" />
          </div>

          <SettingsItem title="Alias" subtitle="an alias for feed title">
            <input
              ref={aliasRef}
              class="d-input"
              type="text"
              placeholder={title()}
            />
          </SettingsItem>

          <SettingsItem
            title="Tags"
            subtitle={<>Set tags for this feed. <br /> (Type and press Enter to add new tag)</>}
            grow
          >
            <Select
              class="[&_.solid-select-list]:text-sm"
              initialValue={tags()}
              placeholder=""
              multiple
              onChange={setTags}
              {...tagSelectOptions()}
            />
          </SettingsItem>

          <SettingsItem
            title="Resource Base URL"
            subtitle="used for archiving resources"
          >
            <input
              ref={baseUrlRef}
              class="d-input"
              type="text"
              placeholder="(auto)"
            />
          </SettingsItem>

          <SettingsItem
            title="After Date"
            subtitle={<>only fetch entries after a date (ISO format) <br /> used by <strong>Clean</strong> to remove old entries</>}
          >
            <input
              ref={afterDateRef}
              class="d-input"
              type="text"
              placeholder="(none)"
            />
          </SettingsItem>

          <SettingsItem
            title="Playback Rate"
            subtitle="default playback rate for media"
          >
            <input
              ref={playbackRateRef}
              class="d-input"
              type="text"
              placeholder="1"
            />
          </SettingsItem>

          <SettingsItem
            title="Archive Blacklist"
            subtitle="url regex to blacklist when archiving"
          >
            <input
              ref={archiveBlacklistRef}
              class="d-input"
              type="text"
              placeholder="(none)"
            />
          </SettingsItem>

          <SettingsItem
            title="Archive Sequentially"
            subtitle="archive resources sequentially instead of concurrently"
          >
            <input
              class="size-[1.2rem]"
              type="checkbox"
              onChange={e => setArchiveSequential(e.target.checked)}
            />
          </SettingsItem>

          <SettingsItem
            title="Archive Interval"
            subtitle="only applied when archiving sequentially (in seconds)"
          >
            <input
              ref={archiveIntervalRef}
              class="d-input"
              type="text"
              placeholder="(none)"
              disabled={!archiveSequential()}
            />
          </SettingsItem>

          <SettingsItem
            title="Freeze Feed"
            subtitle="no longer update the feed from source"
          >
            <input
              ref={freezeFeedRef}
              class="size-[1.2rem]"
              type="checkbox"
            />
          </SettingsItem>
        </div>

        <div class="px-4 pt-4 pb-2 flex justify-end">
          <TextButton onClick={handleClose}>Close</TextButton>
          <TextButton color="error" onClick={handleReset}>Reset</TextButton>
          <TextButton color="primary" onClick={handleSave}>Save</TextButton>
        </div>
      </div>
    </dialog>
  )
}


