// LFReader
// Copyright (C) 2024-2026  DCsunset
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

import { createEffect } from "solid-js"
import { setState, state } from "../state/store"
import { IconButton, TextButton } from "./ui"
import SettingsItem from "./SettingsItem"
import { version } from "../constants"
import { handleExternalLink } from "../state/actions"
import ExternalLinkIcon from "lucide-solid/icons/external-link"


const handleClose = () => setState("status", "aboutDialog", "open", false)

export default function AboutDialog() {
  let ref!: HTMLDialogElement

  createEffect(() => {
    if (state.status.aboutDialog.open) {
      ref?.showModal()
    } else {
      ref?.close()
    }
  })

  return (
    <dialog ref={ref} class="d-modal">
      <div class="d-modal-box max-h-[80dvh] flex flex-col p-0">
        <h4 class="px-6 pt-6 pb-4 text-xl font-medium">About LFReader</h4>

        <div class="flex flex-col px-6 gap-3 overflow-y-scroll">
          <SettingsItem title="Version">
            {version}
          </SettingsItem>

          <SettingsItem title="GitHub Repo">
            <IconButton
              color="inherit"
              target="_blank"
              href="https://github.com/DCsunset/LFReader"
              onClick={handleExternalLink}
            >
              <ExternalLinkIcon class="size-[1.3rem]" />
            </IconButton>
          </SettingsItem>

          <SettingsItem title="Tips">
            <ul class="m-0 text-left list-disc">
              <li>Double click on app bar to scroll to top</li>
              <li>Swipe on mobile device to open/close lists</li>
            </ul>
          </SettingsItem>
        </div>

        <div class="px-4 pt-4 pb-2 flex justify-end">
          <TextButton onClick={handleClose}>Close</TextButton>
        </div>
      </div>
    </dialog>
  )
}

