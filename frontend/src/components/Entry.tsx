// LFReader
// Copyright (C) 2022-2025  DCsunset
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

import { Show, For, useContext, createEffect } from "solid-js";
import LinkIcon from "lucide-solid/icons/link"
import CalendarIcon from "lucide-solid/icons/calendar"
import RssIcon from "lucide-solid/icons/rss"
import UserIcon from "lucide-solid/icons/user"
import TagIcon from "lucide-solid/icons/tag"
import ChevronRightIcon from "lucide-solid/icons/chevron-right"
import { Ctx, SearchParams } from "../state/context";
import { Enclosure, getEntryDate, getEntryTitle, getFeedTitle, textCategories, toEntryId } from "../state/feed";
import { displayDate } from "../util/date";
import { createSignal } from "solid-js";
import { Switch } from "solid-js";
import { Match } from "solid-js";
import MediaPlayer from "./MediaPlayer";
import { derivedState, state } from "../state/store";
import { createMemo } from "solid-js";
import hljs from "highlight.js"
import renderMathInElement from "katex/contrib/auto-render"
import { useSearchParams } from "@solidjs/router";
import { handleExternalLink } from "../state/actions";

import "highlight.js/styles/base16/tomorrow-night.css"
import "katex/dist/katex.css"


function EnclosureItem(props: {
  item: Enclosure,
  class?: string,
  // Playback rates
  defaultRate?: string,
  rates?: string[],
}) {
  return (
    <div class={props.class}>
      <Switch fallback={<a href={props.item.href}>{props.item.href}</a>}>
        <Match when={props.item.type.startsWith("image/")}>
          <img src={props.item.href} />
        </Match>
        <Match when={props.item.type.startsWith("audio/")}>
          <MediaPlayer
            audio
            src={props.item.href}
            defaultRate={props.defaultRate}
            rates={props.rates}
          />
        </Match>
        <Match when={props.item.type.startsWith("video/")}>
          <MediaPlayer
            src={props.item.href}
            defaultRate={props.defaultRate}
            rates={props.rates}
          />
        </Match>
      </Switch>
    </div>
  )
}

// reference: W3C default style
// https://html.spec.whatwg.org/multipage/rendering.html
const entryContentClasses = [
  "[&_p,dl,blockquote,listing,plaintext,figure,pre,xmp,ol,ul]:my-4",
  "[&_ol_ul,ul_ol,ul_ul,ol_ol]:my-0",
  "[&_dd,blockquote,figure,ol,ul]:ms-8",
  "[&_h1]:text-[1.4em]",
  "[&_h2]:text-[1.35em]",
  "[&_h3]:text-[1.3em]",
  "[&_h4]:text-[1.25em]",
  "[&_h5]:text-[1.2em]",
  "[&_h6]:text-[1.15em]",
  "[&_abbr,acronym]:decoration-dotted",
  "[&_u,ins,abbr,acronym,:link,:visited]:underline",
  "[&_del,s,strike]:line-through",
  "[&_address,cite,dfn,em,i,var]:italic",
  "[&_h1,h2,b,strong,th]:font-bold",
  "[&_h3,h4]:font-semibold",
  "[&_h5,h6]:font-medium",
  "[&_h1,h2,h3,h4,h5,h6]:my-6",
  "[&_ul]:list-disc",
  "[&_ol]:list-decimal",
  "[&_table]:border-spacing-1",
  "[&_td,th]:p-1",
  "[&_caption]:text-center",
  "[&_mark]:bg-secondary",
  "[&_:link]:text-sky-400",
  "[&_:visited]:text-violet-400",
].join(" ")

export default function Entry() {
  const ctx = useContext(Ctx)!
  const [searchParams, _setSearchParams] = useSearchParams<SearchParams>()
  const [enclosureOpen, setEnclosureOpen] = createSignal(true)
  const contents = createMemo(() => {
    const e = ctx.currentEntryContent()
    let c = e?.contents || [];
    if (c.length === 0) {
      c = e?.summary ? [e.summary] : []
    }
    return c
  })
  let ref!: HTMLDivElement

  createEffect(() => {
    // Render on entry content update
    const entryUrlMap = derivedState.entryUrlMap()
    if (ctx.currentEntryContent()) {
      // render math
      renderMathInElement(ref, { throwOnError: false })

      // highlight code
      ref.querySelectorAll("pre code:not(.hljs)").forEach(el => {
        hljs.highlightElement(el as HTMLElement)
      });
      ref.querySelectorAll(".highlight pre, code:not(.hljs)").forEach(el => {
        el.classList.add("hljs")
      });

      // open link with confirmation
      ref.querySelectorAll("a").forEach((el: HTMLElement) => {
        try {
          const url = new URL(el.getAttribute("href") || "")
          const e = entryUrlMap.get(url.origin)
          if (e) {
            // replace external link with internal link
            el.setAttribute("href", `/?${new URLSearchParams({
              ...searchParams,
              entry: toEntryId(e)
            })}${url.hash}`)
          }
          else {
            el.setAttribute("target", "_blank")
            el.addEventListener("click", handleExternalLink)
          }
        }
        catch (_) {
          // do nothing for relative links to local resources
          // (new URL() will throw if it's a relative link)
        }
      })
    }
  })

  return (
    <Show when={ctx.currentEntryContent()}>
      <div ref={ref}>
        <h5 class="text-2xl font-semibold">
          {getEntryTitle(ctx.currentEntryContent())}
          <a
            class="inline-block ml-3 opacity-60"
            href={ctx.currentEntryContent()?.link}
          >
            {/* set min-width to prevent shrinking when not enough space */}
            <LinkIcon class="min-w-[1.2rem] size-[1.2rem]" />
          </a>
        </h5>

        <div class="d-divider my-1" />

        <header class="flex flex-wrap gap-x-4 gap-y-2 opacity-75 font-semibold">
          <div class="inline-flex items-center">
            <CalendarIcon class="mr-1.5 min-w-[1.2rem] size-[1.2rem]" />
            {displayDate(getEntryDate(ctx.currentEntryContent()))}
          </div>
          <div class="inline-flex items-center">
            <RssIcon class="mr-1.5 min-w-[1.2rem] size-[1.2rem]" />
            <a href={ctx.currentEntryFeed()?.link}>
              {getFeedTitle(ctx.currentEntryFeed())}
            </a>
          </div>
          <Show when={ctx.currentEntryContent()?.author}>
            <div class="inline-flex items-center">
              <UserIcon class="mr-1.5 min-w-[1.2rem] size-[1.2rem]" />
              {ctx.currentEntryContent()?.author}
            </div>
          </Show>
          <Show when={(ctx.currentEntryContent()?.categories?.length ?? 0) > 0}>
            <div class="inline-flex items-center">
              <TagIcon class="mr-1.5 min-w-[1.2rem] size-[1.2rem]" />
              <span class="inline-flex flex-wrap gap-2">
                <For each={textCategories(ctx.currentEntryContent()?.categories)}>
                  {(c, _index) => (
                    <span class="d-badge d-badge-soft bg-base-content/15!">
                      {c}
                    </span>
                  )}
                </For>
              </span>
            </div>
          </Show>
          <Show when={(ctx.currentEntryContent()?.enclosures?.length ?? 0) > 0}>
            <div class="d-collapse">
              <input type="checkbox" class="hidden" checked={enclosureOpen()} />

              {/* Force width to be 100% to prevent overflow */}
              <div
                class="d-collapse-title px-0 pt-3 pb-0 min-h-0 cursor-pointer select-none inline-flex items-center min-w-full max-w-full"
                onClick={() => setEnclosureOpen(!enclosureOpen())}
              >
                <ChevronRightIcon
                  class={`mr-1.5 transition-transform size-[1.2rem] ${enclosureOpen() ? "rotate-90" : ""}`}
                />
                Enclosures: {ctx.currentEntryContent()?.enclosures.length} file(s)
              </div>
              <div class="d-collapse-content pb-0! min-w-full max-w-full">
                <For each={ctx.currentEntryContent()?.enclosures}>
                  {(e, _index) => (
                    <EnclosureItem
                      class="mt-3 overflow-x-scroll min-w-full"
                      item={e}
                      defaultRate={ctx.currentEntryFeed()?.user_data.playback_rate}
                      rates={state.settings.playbackRates}
                    />
                  )}
                </For>
              </div>
            </div>
          </Show>
        </header>

        <div class={entryContentClasses}>
          <For each={contents()}>
            {(c, _index) => {
              const propName = c.type === "text/plain"
                ? "children"
                : "innerHTML"
              const props = { [propName]: c.value }
              return <div class="my-6" {...props} />
            }}
          </For>
        </div>
      </div>
    </Show>
  )
}

