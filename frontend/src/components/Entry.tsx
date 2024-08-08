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

import { createRef } from "preact";
import { computed, signal } from "@preact/signals";
import { appState, computedState, lookupEntry, lookupFeed  } from "../store/state";
import { Enclosure, getEntryTitle, getFeedTitle, toEntryId } from "../store/feed";
import { Box, Collapse, Divider, List, ListItem, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiAccount, mdiAttachment, mdiCalendarMonth, mdiChevronDown, mdiRss } from "@mdi/js";
import { displayDate } from "../utils/date";
import { useEffect } from "preact/hooks";
import renderMathInElement from "katex/contrib/auto-render";
import hljs from "highlight.js";
import "katex/dist/katex.css";
import "highlight.js/styles/base16/tomorrow-night.css";
import { anchorNoStyle } from "../utils/styles";
import { handleExternalLink } from "../store/actions";

hljs.configure({
  // prevent logging the errors in console
  ignoreUnescapedHTML: true
});

const showEnclosures = signal(true);
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

function EnclosureView({ value }: { value: Enclosure }) {
  if (value.type.startsWith("image/")) {
    return <img src={value.href} />;
  }
  else if (value.type.startsWith("audio/")) {
    return (
      <audio controls>
        <source src={value.href} type={value.type} />
      </audio>
    );
  }
  else if (value.type.startsWith("video/")) {
    return (
      <video controls>
        <source src={value.href} type={value.type} />
      </video>
    );
  }
  else {
    return <a href={value.href}>{value.href}</a>;
  }
}

export default function Entry() {
  const entry = computedState.selectedEntry.value;
  const feed = lookupFeed(entry?.feed_url);
  const author = entry?.author || feed?.author;

  // this hook runs every time entry changes
  // must use useEffect instead of signal effect because it needs the page to load first
  useEffect(() => {
    const element = entryRef.current;
    // element will only be null if entry is not defined
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
        const e = lookupEntry(el.getAttribute("href"));
        if (e) {
          // replace external link with internal link
          el.setAttribute("href", `/?${new URLSearchParams({
            ...appState.queryParams.value,
            entry: toEntryId(e)
          })}`);
        } else {
          el.setAttribute("target", "_blank");
        }
        el.addEventListener("click", handleExternalLink);
      });
    }
  }, [entry]);

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
          <Typography variant="info" sx={{ display: "flex", my: 1, flexWrap: "wrap" }}>
            <Box sx={{ display: "inline-flex", mb: 1 }}>
              <Icon path={mdiCalendarMonth} size={1} />
              <Box sx={{ ml: 0.5, mr: 1.5 }}>
                {displayDate(entry.published_at ?? entry.updated_at ?? entry.server_data.added_at)}
              </Box>
            </Box>

            <Box sx={{ display: "inline-flex", mb: 1 }}>
              <Icon path={mdiRss} size={1} />
              <Box sx={{ ml: 0.5, mr: 1.5 }}>
                {/* Don't add onClick here as it's added in the hook already */}
                <a
                  href={feed?.link}
                  target="_blank"
                  style={anchorNoStyle}
                >
                  {getFeedTitle(feed)}
                </a>
              </Box>
            </Box>

            {author &&
              <>
                <Box sx={{ display: "inline-flex", mb: 1 }}>
                  <Icon path={mdiAccount} size={1} />
                  <Box sx={{ ml: 0.5, mr: 1.5 }}>
                    {author}
                  </Box>
                </Box>
              </>
            }
          </Typography>
          {entry.enclosures.length > 0 &&
            <>
              <Typography variant="info" sx={{ display: "flex" }} onClick={() => showEnclosures.value = !showEnclosures.value}>
                <Icon
                  path={mdiChevronDown}
                  style={{
                    transform: `rotate(${showEnclosures.value ? "0" : "-90deg"})`,
                    transition: "all 0.2s"
                  }}
                  size={1}
                />
                <Icon path={mdiAttachment} size={0.9} />
                <Box sx={{ ml: 0.5, mr: 1.5 }}>
                  Enclosures: {entry.enclosures.length} file(s)
                </Box>
              </Typography>

              <Collapse in={showEnclosures.value}>
                <List>
                  {entry.enclosures.map(e => (
                    <ListItem key={e.href} dense>
                      <EnclosureView value={e} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          }

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
