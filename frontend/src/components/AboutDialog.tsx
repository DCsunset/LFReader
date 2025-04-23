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

import { Signal } from "@preact/signals";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
  IconButton,
  Stack
} from "@mui/material";
import { handleExternalLink } from "../store/actions";
import { mdiOpenInNew } from "@mdi/js";
import Icon from "@mdi/react";
import version from "../_version";

function Item({ title, children }: {
  title: string,
  children: any
}) {
  return (
    <Stack direction="row" className="w-full">
      <span className="font-medium opacity-90 flex items-center">{title}</span>
      <span className="grow min-w-6" />
      <span>{children}</span>
    </Stack>
  );
}

function AboutDialog({ open }: {
  open: Signal<boolean>
}) {
  const close = () => { open.value = false; };

	return (
		<Dialog
			open={open.value}
			onClose={close}
		>
      <DialogTitle>About LFReader</DialogTitle>
      <DialogContent
        sx={{
          minWidth: {
            md: "400px",
            sm: "300px",
          }
        }}
        className="mt-2"
      >
        <Stack spacing={1.2}>
          <Item title="Version">
            {version}
          </Item>
          <Item title="GitHub Repo">
            <IconButton
              color="inherit"
              target="_blank"
              href="https://github.com/DCsunset/LFReader"
              onClick={handleExternalLink}
            >
              <Icon path={mdiOpenInNew} size={1} />
            </IconButton>
          </Item>
          <Item title="Tips">
            <ul className="m-0">
              <li>Double click on app bar to scroll to top</li>
              <li>Swipe on mobile device to open/close lists</li>
            </ul>
          </Item>
        </Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={close}>
          Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default AboutDialog;
