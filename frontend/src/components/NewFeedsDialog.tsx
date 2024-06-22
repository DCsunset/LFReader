// LFReader
// Copyright (C) 2022-2024  DCsunset

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

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { Signal, signal, batch } from "@preact/signals";
import { fetchData } from "../store/actions";

interface Props {
  open: Signal<boolean>
}

const feedUrls = signal("")
const feedUrlsError = signal(false);
const fetchDataInProgress = signal(false);

function setFeedUrls(value: string) {
  batch(() => {
    feedUrls.value = value;
    if (feedUrlsError.peek() && value.length > 0) {
      feedUrlsError.value = false;
    }
  });
}

export default function NewFeedsDialog(props: Props) {
  // reset local states
  const close = () => {
    batch(() => {
      props.open.value = false;
      feedUrls.value = "";
      feedUrlsError.value = false;
    });
  };

  async function submit() {
    fetchDataInProgress.value = true;
    const urls = feedUrls.peek().split("\n").filter(v => v.length > 0);
    if (urls.length === 0) {
      feedUrlsError.value = true;
      return;
    }
    const success = await fetchData(urls);
    if (success) {
      close();
    }
    fetchDataInProgress.value = false;
  }

  return (
    <Dialog
      open={props.open.value}
      onClose={() => props.open.value = false}
      disableBackdropClick
    >
      <DialogTitle sx={{ pb: 0 }}>Add feeds</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          sx={{ mt: 2, width: "400px" }}
          label="Feed URLs (each line is a feed url)"
          error={feedUrlsError.value}
          value={feedUrls.value}
          onChange={(event: any) => setFeedUrls(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={close}>Cancel</Button>
        <Button color="error" onClick={() => feedUrls.value = ""}>Reset</Button>
        <Button color="primary" onClick={submit} disabled={fetchDataInProgress.value}>
          {fetchDataInProgress.value
            ? <CircularProgress color="inherit" size={20} />
            : <span>Submit</span>}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

