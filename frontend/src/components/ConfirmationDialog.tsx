// LFReader
// Copyright (C) 2024  DCsunset

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

import { appState } from "../store/state";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

function ConfirmationDialog() {
  const close = () => {
    appState.confirmation.open.value = false;
  };

  const confirm = () => {
    close();
    appState.confirmation.onConfirm();
  };

	return (
		<Dialog
			open={appState.confirmation.open.value}
			onClose={close}
		>
			<DialogTitle>Confirm</DialogTitle>
			<DialogContent>
				<DialogContentText>{appState.confirmation.content.value}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={close}>
					Cancel
				</Button>
				<Button color="error" onClick={confirm}>
					Yes
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ConfirmationDialog;
