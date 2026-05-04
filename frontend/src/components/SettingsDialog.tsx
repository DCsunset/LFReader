// LFReader
// Copyright (C) 2022-2026  DCsunset
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

import { batch, createEffect, createMemo } from "solid-js"
import { setState, state } from "../state/store"
import SettingsItem from "./SettingsItem"
import { MultiSelect, TextButton } from "./ui"
import { concatClasses } from "../util/css"
import { createSignal } from "solid-js"
import { createOptions } from "@thisbeyond/solid-select"
import { parseNumber } from "../util/misc"
import SaveIcon from "lucide-solid/icons/save"
import BrushCleaningIcon from "lucide-solid/icons/brush-cleaning"
import { dispatchFeedAction } from "../state/actions"

async function handleArchive() {
  await dispatchFeedAction({ action: "archive" });
}

async function handleClean() {
  await dispatchFeedAction({ action: "clean" });
}

export default function SettingsDialog() {
  const [pageSizeError, setPageSizeError] = createSignal(false)
  const [playbackRates, setPlaybackRates] = createSignal<string[]>([])
  const playbackRateOptions = createMemo(() => createOptions(
    [],
    {
      // only allow adding valid numbers
      createable: value => {
        if (playbackRates().includes(value)) {
          return
        }
        const n = parseNumber(value)
        if (n === undefined || n <= 0 || n > 10) {
          return
        }
        return [value]
      },
    }
  ))
  const [reloadIntervalError, setReloadIntervalError] = createSignal(false)
  const loading = () => state.status.loading
  const hasError = () => pageSizeError() || reloadIntervalError()

  let ref!: HTMLDialogElement
  let pageSizeRef!: HTMLInputElement
  let archiveRef!: HTMLInputElement
  let forceArchiveRef!: HTMLInputElement
  let confirmOnExternalLinkRef!: HTMLInputElement
  let reloadIntervalRef!: HTMLInputElement

  function handleReset() {
    const s = state.settings
    pageSizeRef.value = s.pageSize.toString()
    setPlaybackRates(s.playbackRates ?? [])
    archiveRef.checked = s.archive
    forceArchiveRef.checked = s.forceArchive
    confirmOnExternalLinkRef.checked = s.confirmOnExternalLink
    reloadIntervalRef.value = s.reloadInterval.toString()
  }

  function handleClose() {
    setState("status", "settingsDialog", "open", false)
    handleReset()
  }

  function handleSave() {
    if (hasError()) {
      return
    }

    const rates = playbackRates()
    batch(() => {
      setState("settings", {
        pageSize: parseInt(pageSizeRef.value),
        playbackRates: rates.length > 0 ? rates : undefined,
        archive: archiveRef.checked,
        forceArchive: forceArchiveRef.checked,
        confirmOnExternalLink: confirmOnExternalLinkRef.checked,
        reloadInterval: parseInt(reloadIntervalRef.value),
      })
      handleClose()
    })
  }

  createEffect(() => {
    if (state.status.settingsDialog.open) {
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
        <h4 class="px-6 pt-6 pb-4 text-xl font-medium">Settings</h4>

        <div class="flex flex-col px-6 gap-3 overflow-y-scroll">
          <div>
            <h6 class="font-semibold opacity-70">General</h6>
            <div class="d-divider m-0" />
          </div>

          <SettingsItem
            title="Number of entries per page"
            subtitle="positive integer"
          >
            <input
              ref={pageSizeRef}
              type="number"
              class={concatClasses([
                "d-input",
                "max-w-20",
                {
                  "d-input-error": pageSizeError()
                }
              ])}
              onInput={e => {
                // type=number will return empty string if invalid
                const n = parseNumber(e.target.value, true)
                setPageSizeError(n === undefined || n <= 0)
              }}
            />
          </SettingsItem>

          <SettingsItem
            title="Playback Rates"
            subtitle={<>Enclosure playback rates (0, 10]<br /> (Enter to add number)</>}
          >
            <MultiSelect
              class="[&_.solid-select-list]:hidden"
              placeholder="default"
              initialValue={playbackRates()}
              onChange={setPlaybackRates}
              {...playbackRateOptions()}
            />
          </SettingsItem>

          <SettingsItem
            title="Archive resources"
            subtitle="download resources (e.g. images) and save them locally"
          >
            <input
              type="checkbox"
              ref={archiveRef}
              class="size-[1.2rem]"
            />
          </SettingsItem>

          <SettingsItem
            title="Force Archiving"
            subtitle="force archiving entries even if content doesn't change"
          >
            <input
              type="checkbox"
              ref={forceArchiveRef}
              class="size-[1.2rem]"
            />
          </SettingsItem>

          <SettingsItem
            title="Confirm on External Link"
            subtitle="confirm before opening external link"
          >
            <input
              type="checkbox"
              ref={confirmOnExternalLinkRef}
              class="size-[1.2rem]"
            />
          </SettingsItem>

          <SettingsItem
            title="Check update from server periodically"
            subtitle="in seconds (0 means disabled)"
          >
            <input
              ref={reloadIntervalRef}
              class={concatClasses([
                "d-input",
                "max-w-20",
                {
                  "d-input-error": reloadIntervalError()
                }
              ])}
              onInput={e => {
                // type=number will return empty string if invalid
                const n = parseNumber(e.target.value)
                setReloadIntervalError(n === undefined || n < 0)
              }}
            />
          </SettingsItem>


          <div class="mt-4">
            <h6 class="font-semibold opacity-70">Database</h6>
            <div class="d-divider m-0" />
          </div>

          <SettingsItem title="Database Operations">
            <TextButton
              class="d-btn-sm text-sm px-2"
              color="primary"
              loading={loading()}
              onClick={handleArchive}
            >
              <span class="flex items-center">
                <SaveIcon class="size-[1.3rem] mr-1" />
                Archive
              </span>
            </TextButton>

            <TextButton
              class="d-btn-sm text-sm px-2"
              color="secondary"
              loading={loading()}
              onClick={handleClean}
            >
              <span class="flex items-center">
                <BrushCleaningIcon class="size-[1.3rem] mr-1" />
                Clean
              </span>
            </TextButton>
          </SettingsItem>
        </div>

        <div class="px-4 pt-4 pb-2 flex justify-end">
          <TextButton onClick={handleClose}>Close</TextButton>
          <TextButton color="error" onClick={handleReset}>Reset</TextButton>
          <TextButton color="primary" disabled={hasError()} onClick={handleSave}>Save</TextButton>
        </div>
      </div>
    </dialog>
  )
}

