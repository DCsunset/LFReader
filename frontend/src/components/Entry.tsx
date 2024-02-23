import { computed } from "@preact/signals";
import { computedState  } from "../store/state";
import { toEntryId } from "../store/feed";
import { Box, Divider, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiCalendarMonth } from "@mdi/js";
import { displayDate } from "../utils/date";

const currentContents = computed(() => {
  const entry = computedState.selectedEntry.value;
  let contents = entry?.contents || [];
  if (contents.length === 0) {
    contents = entry?.summary ? [entry?.summary] : [];
  }
  return contents;
});
const currentEntryId = computed(() => {
  return toEntryId(computedState.selectedEntry.value);
})

export default function Entry() {
  const entry = computedState.selectedEntry.value;
  return (
    <>
      {entry &&
        <Box
          id="lfreader-entry"
          sx={{
            // prevent images from overflowing
            "& img": {
              maxWidth: "85%",
              // overwrite existing fixed width and height
              width: "auto",
              height: "auto"
            }
          }}
        >
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            {entry.title}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="info" sx={{ display: "flex" }}>
            <Icon path={mdiCalendarMonth} size={0.9} />
            <Box sx={{ ml: 0.5 }}>{displayDate(entry.published_at)}</Box>
          </Typography>

          {currentContents.value.map((v, i) => (
            // If it's text/plain, content is not sanitized
            v.type === "text/plain" ?
              <div>{v.value}</div> :
              <div
                key={`${currentEntryId.value} ${i}`}
                dangerouslySetInnerHTML={{ __html: v.value }}
              />
          ))}
        </Box>
      }
    </>
  );
}
