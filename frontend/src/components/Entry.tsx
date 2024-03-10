import { createRef } from "preact";
import { computed } from "@preact/signals";
import { computedState, lookupFeed  } from "../store/state";
import { getEntryTitle, getFeedTitle, toEntryId } from "../store/feed";
import { Box, Divider, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiCalendarMonth, mdiRss } from "@mdi/js";
import { displayDate } from "../utils/date";
import { useEffect } from "preact/hooks";
import renderMathInElement from "katex/contrib/auto-render";
import hljs from "highlight.js";
import "katex/dist/katex.css";
import "highlight.js/styles/base16/tomorrow-night.css";
import { anchorNoStyle } from "../utils/styles";

hljs.configure({
  // prevent logging the errors in console
  ignoreUnescapedHTML: true
});

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
const entryRef = createRef<HTMLElement>();

export default function Entry() {
  const entry = computedState.selectedEntry.value;
  const feed = lookupFeed(entry?.feed_url);

  // this hook runs every time it re-rerenders
  useEffect(() => {
    const element = entryRef.current;
    if (element) {
      // render math formula
      renderMathInElement(element, {
        throwOnError: false
      });
      // highlight code on update
      element.querySelectorAll("pre code:not(.hljs)").forEach((el: HTMLElement) => {
        hljs.highlightElement(el);
      });
      element.querySelectorAll("pre code:not(.hljs)").forEach((el: HTMLElement) => {
        hljs.highlightElement(el);
      });
      element.querySelectorAll(".highlight pre, code:not(.hljs)").forEach((el: HTMLElement) => {
        el.classList.add("hljs")
      });
      // open link in external page
      element.querySelectorAll("a").forEach((el: HTMLElement) => {
        el.setAttribute("target", "_blank");
      });
    }
  });

  return (
    <>
      {entry &&
        <Box
          id="lfreader-entry"
          ref={entryRef}
          sx={{
            // prevent images and videos from overflowing
            "& img, & video": {
              maxWidth: "100%",
              // overwrite existing fixed width and height
              width: "auto",
              height: "auto"
            }
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 1,
              fontWeight: 600
            }}
          >
            {getEntryTitle(entry)}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="info" sx={{ display: "flex" }}>
            <Icon path={mdiCalendarMonth} size={0.9} />
            <Box sx={{ ml: 0.5, mr: 1.5 }}>{displayDate(entry.published_at ?? entry.updated_at)}</Box>

            <Icon path={mdiRss} size={0.9} />
            <Box sx={{ ml: 0.5 }}>
              <a
                href={feed?.link}
                target="_blank"
                style={anchorNoStyle}
              >
                {getFeedTitle(feed)}
              </a>
            </Box>
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
