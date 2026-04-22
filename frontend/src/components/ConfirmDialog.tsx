// LFReader
// Copyright (C) 2024-2026  DCsunset

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

import { setState, state } from "../state/store"
import { createEffect } from "solid-js"
import { TextButton } from "./ui"

const handleClose = () => setState("status", "confirmDialog", "open", false)
const handleConfirm = () => {
  state.status.confirmDialog.onConfirm?.()
  handleClose()
}

export default function ConfirmDialog() {
  let ref!: HTMLDialogElement

  createEffect(() => {
    if (state.status.confirmDialog.open) {
      ref?.showModal()
    } else {
      ref?.close()
    }
  })

	return (
    <dialog ref={ref} class="d-modal">
      <div class="d-modal-box max-h-[80dvh] flex flex-col p-0">
        <h4 class="px-6 pt-6 pb-4 text-xl font-medium">Confirm</h4>

        <div class="px-6 py-3">{state.status.confirmDialog.content}</div>

        <div class="px-4 pt-4 pb-2 flex justify-end">
          <TextButton onClick={handleClose}>Cancel</TextButton>
          <TextButton color="error" onClick={handleConfirm}>Confirm</TextButton>
        </div>
      </div>
		</dialog>
	);
}

