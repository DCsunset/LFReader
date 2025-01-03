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

import { computed, signal } from "@preact/signals";
import { createRef } from "preact";
import { appState, computedState, lookupEntry, lookupFeed  } from "../store/state";
import { Enclosure, Feed, getEntryTitle, getFeedTitle, toEntryId } from "../store/feed";
import Icon from "@mdi/react";
import renderMathInElement from "katex/contrib/auto-render";
import hljs from "highlight.js";
import "katex/dist/katex.css";
import "highlight.js/styles/base16/tomorrow-night.css";
import { anchorNoStyle } from "../utils/styles";
import { handleExternalLink } from "../store/actions";
import { displayDate } from "../utils/date";
import MediaPlayer from "./MediaPlayer";
import { useEffect } from "preact/hooks";
import { Box, Collapse, Divider, List, ListItem, Typography } from "@mui/material";
import { mdiAccount, mdiAttachment, mdiCalendarMonth, mdiChevronDown, mdiRss } from "@mdi/js";

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
  const e = computedState.selectedEntry.value;
  return e && toEntryId(e);
})
const entryRef = createRef<HTMLElement>();


function EnclosureView({ feed, enclosure }: {
  feed?: Feed,
  enclosure: Enclosure
}) {
  if (enclosure.type.startsWith("image/")) {
    return <img src={enclosure.href} />;
  }
  else if (enclosure.type.startsWith("audio/")) {
    return <MediaPlayer audio src={enclosure.href} rate={feed?.user_data.playback_rate} />;
  }
  else if (enclosure.type.startsWith("video/")) {
    return <MediaPlayer src={enclosure.href} rate={feed?.user_data.playback_rate} />;
  }
  else {
    return <a href={enclosure.href}>{enclosure.href}</a>;
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
      element.querySelectorAll("pre code:not(.hljs)").forEach(el => {
        hljs.highlightElement(el as HTMLElement);
      });
      element.querySelectorAll(".highlight pre, code:not(.hljs)").forEach(el => {
        el.classList.add("hljs");
      });

      // open link in external page
      element.querySelectorAll("a").forEach((el: HTMLElement) => {
        try {
          const url = new URL(el.getAttribute("href") || "");
          const e = lookupEntry(url.origin);
          if (e) {
            // replace external link with internal link
            el.setAttribute("href", `/?${new URLSearchParams({
              ...appState.queryParams.value,
              entry: toEntryId(e)
            })}${url.hash}`);
          }
          else {
            el.setAttribute("target", "_blank");
            el.addEventListener("click", handleExternalLink);
          }
        }
        catch (_) {
          // do nothing for relative link (including hash)
        }
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
          {entry.enclosures && entry.enclosures.length > 0 &&
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
                    <ListItem key={e.href} dense className="overflow-x-scroll overflow-y-hidden">
                      <EnclosureView feed={feed} enclosure={e} />
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
