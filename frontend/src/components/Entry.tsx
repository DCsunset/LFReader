// LFReader
// Copyright (C) 2022-2025  DCsunset

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
import { appState, computedState, lookupEntryUrl, lookupFeed } from "../store/state";
import { textCategories, Enclosure, getEntryTitle, getFeedTitle, toEntryId, getEntryDate } from "../store/feed";
import Icon from "@mdi/react";
import renderMathInElement from "katex/contrib/auto-render";
import hljs from "highlight.js";
import "katex/dist/katex.css";
import "highlight.js/styles/base16/tomorrow-night.css";
import { anchorNoStyle } from "../utils/styles";
import { handleExternalLink } from "../store/actions";
import { displayDate } from "../utils/date";
import MediaPlayer from "./MediaPlayer";
import { Box, Chip, Collapse, Divider, List, ListItem, Typography } from "@mui/material";
import { mdiAccount, mdiAttachment, mdiCalendarMonth, mdiChevronDown, mdiRss, mdiTag } from "@mdi/js";
import { useEffect } from "preact/hooks";

hljs.configure({
  // prevent logging the errors in console
  ignoreUnescapedHTML: true
});

const entry = computedState.selectedEntry;
const title = computed(() => getEntryTitle(entry.value));
const date = computed(() => {
  return displayDate(getEntryDate(entry.value));
})
const author = computed(() => entry.value?.author || feed.value?.author);
const categories = computed(() => textCategories(entry.value?.categories));
const feed = computed(() => lookupFeed(entry.value?.feed_url));
const feedTitle = computed(() => getFeedTitle(feed.value));

const showEnclosures = signal(true);
const currentContents = computed(() => {
  const e = entry.value;
  let contents = e?.contents || [];
  if (contents.length === 0) {
    contents = e?.summary ? [e?.summary] : [];
  }
  return contents;
});
const currentEntryId = computed(() => {
  const e = entry.value;
  return e && toEntryId(e);
})
const entryRef = createRef<HTMLElement>();


function EnclosureView({ enclosure }: {
  enclosure: Enclosure
}) {
  if (enclosure.type.startsWith("image/")) {
    return <img src={enclosure.href} />;
  }
  else if (enclosure.type.startsWith("audio/")) {
    return <MediaPlayer audio src={enclosure.href} rate={feed.value?.user_data.playback_rate} />;
  }
  else if (enclosure.type.startsWith("video/")) {
    return <MediaPlayer src={enclosure.href} rate={feed.value?.user_data.playback_rate} />;
  }
  else {
    return <a href={enclosure.href}>{enclosure.href}</a>;
  }
}

function HeaderItem({ icon, children }: {
  icon: string,
  children: any
}) {
  return (
    <div className="inline-flex mb-2 mr-1 items-center">
      <Icon path={icon} size={1} />
      <span className="ml-1 mr-2">
        {children}
      </span>
    </div>
  );
}

export default function Entry() {
  // this hook runs every time entry changes
  // must use useEffect instead of signal effect because it needs the page to load first
  useEffect(() => {
    const element = entryRef.current;
    // Subscribe to entry.value
    if (entry.value && element) {
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
          const e = lookupEntryUrl(url.origin);
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
  });

  return (
    <>
      {entry.value &&
        <Box
          id="lfreader-entry"
          ref={entryRef}
          sx={{
            // prevent images and videos from overflowing
            "& img, & video, & svg": {
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
            <a
              href={entry.value.link}
              style={anchorNoStyle}
            >
              {title}
            </a>
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="info" sx={{ display: "flex", my: 1, flexWrap: "wrap" }}>
            <HeaderItem icon={mdiCalendarMonth}>
              {date}
            </HeaderItem>

            <HeaderItem icon={mdiRss}>
              {/* Don't add onClick here as it's added in the hook already */}
              <a
                href={feed.value?.link}
                style={anchorNoStyle}
              >
                {feedTitle}
              </a>
            </HeaderItem>

            {author.value &&
              <HeaderItem icon={mdiAccount}>
                {author}
              </HeaderItem>}

            {categories.value.length > 0 &&
              <HeaderItem icon={mdiTag}>
                <span className="opacity-80">
                  {categories.value.map(c => (
                    <Chip
                      className="ma-0.8"
                      size="small"
                      key={c}
                      label={c}
                    />
                  ))}
                </span>
              </HeaderItem>}

          </Typography>

          {(entry.value?.enclosures?.length ?? 0) > 0 &&
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
                  Enclosures: {entry.value.enclosures.length} file(s)
                </Box>
              </Typography>

              <Collapse in={showEnclosures.value}>
                <List>
                  {entry.value.enclosures.map(en => (
                    <ListItem key={en.href} dense className="overflow-x-scroll overflow-y-hidden">
                      <EnclosureView enclosure={en} />
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
