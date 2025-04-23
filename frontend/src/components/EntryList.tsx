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

import { Checkbox, Divider, FormControl, FormControlLabel, IconButton, List, ListItemButton, Menu, Pagination, Radio, RadioGroup, Stack, TextField } from "@mui/material";
import { computedState, lookupFeed, appState, fromEntryId } from "../store/state";
import { Entry, getEntryDate, getFeedTitle, toEntryId } from "../store/feed";
import { dispatchEntryAction, EntryInfo, updateQueryParams } from "../store/actions";
import { batch, computed, effect, signal } from "@preact/signals";
import { displayDateDiff } from "../utils/date";
import { mdiArrowLeft, mdiCheckboxMultipleOutline, mdiCheckboxOutline, mdiCircle, mdiClose, mdiEmailAlertOutline, mdiEmailOpenOutline, mdiFormatListChecks, mdiMagnify, mdiSortAlphabeticalAscending } from "@mdi/js";
import Icon from "@mdi/react";
import { preventEventDefault } from "../utils/dom";
import * as immutable from "immutable";
import { forwardRef } from "preact/compat";

const { entrySortBy, entrySortDesc } = appState.state
const { previousEntry } = appState.data;
const { currentPage, selectedEntryId, filteredEntries, displayedEntries } = computedState

const numPages = computed(() => (
  Math.ceil(
    filteredEntries.value.length / appState.settings.value.pageSize
  )
))

async function updateEntries(entries: EntryInfo[]) {
  return await dispatchEntryAction({
    action: "update",
    entries,
  })
}

const searchMode = signal(false)
const entryTitleFilter = signal("")
const selectMode = signal(false)
const selectedItems = signal(immutable.Set<string>())
const toolbar = computed(() => !searchMode.value && !selectMode.value)

const sortMenuAnchor = signal<HTMLElement|null>(null)

function cancelSearch() {
  updateQueryParams({ entryTitleFilter: undefined });
}

function handleSearch() {
  const filter = entryTitleFilter.value;
  updateQueryParams({
    entryTitleFilter: filter.length > 0 ? filter : undefined
  });
}

function handleSearchKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    cancelSearch();
  }
  else if (event.key === "Enter") {
    handleSearch();
    event.preventDefault();
  }
}

effect(() => {
  const filter = appState.queryParams.value.entryTitleFilter || "";
  batch(() => {
    entryTitleFilter.value = filter;
    searchMode.value = Boolean(filter);
  });
});

function startSelect() {
  batch(() => {
    selectMode.value = true
    const current = selectedEntryId.value
    selectedItems.value = immutable.Set(current && [ current ])
  })
}

function handleSelect(entryId: string) {
  const selected = selectedItems.value
  if (selected.has(entryId)) {
    selectedItems.value = selectedItems.value.delete(entryId)
  } else {
    selectedItems.value = selectedItems.value.add(entryId)
  }
}

function handleSelectPage() {
  selectedItems.value = selectedItems.value.union(
    displayedEntries.value.map(toEntryId)
  )
}

function handleSelectAll() {
  selectedItems.value = selectedItems.value.union(
    filteredEntries.value.map(toEntryId)
  )
}

function isSelected(entryId: string) {
  if (selectMode.value) {
    return selectedItems.value.has(entryId)
  } else {
    return selectedEntryId.value === entryId
  }
}

function handleMarkEntries(selected: immutable.Set<string>, read: boolean) {
  const updateEntry = (e: Entry) => {
    if (selected.has(toEntryId(e))) {
      return {
        ...e,
        user_data: {
          ...e.user_data,
          read,
        },
      }
    } else {
      return e
    }
  }

  // update user_data locally for responsiveness
  batch(() => {
    appState.data.entries.value = appState.data.entries.value.map(updateEntry);
    appState.data.entryContents.value = appState.data.entryContents.value.map(updateEntry);
  })

  updateEntries(
    selected.toJS()
      .map(fromEntryId)
      .map(e => e && ({
        feed_url: e.feed_url,
        entry_id: e.id,
        user_data: {
          ...e.user_data,
          read,
        },
      } as EntryInfo))
      .filter(e => e !== undefined)
  )
}

// allow passing ref inside the component
const EntryList = forwardRef((
  props: { onClick: (eId: string) => any },
  ref
) => {
	return (
    <Stack direction="column" sx={{ height: "100%" }}>
      {toolbar.value &&
        <div className="flex py-1 px-2">
          <IconButton
            size="small"
            color="inherit"
            title="Select"
            onClick={startSelect}
          >
            <Icon path={mdiFormatListChecks} size={1} />
          </IconButton>
          <IconButton
            size="small"
            color="inherit"
            title="Sort"
            onClick={e => sortMenuAnchor.value = e.currentTarget}
          >
            <Icon path={mdiSortAlphabeticalAscending} size={1} />
          </IconButton>
          <IconButton
            size="small"
            color="inherit"
            title="Search"
            onClick={() => searchMode.value = true}
          >
            <Icon path={mdiMagnify} size={1} />
          </IconButton>
        </div>
      }
      <Menu
        open={Boolean(sortMenuAnchor.value)}
        anchorEl={sortMenuAnchor.value}
        onClose={() => sortMenuAnchor.value = null}
      >
        <FormControl size="small" className="mx-0">
          <RadioGroup
            className="px-3"
            value={entrySortBy.value}
            onChange={e => batch(() => {
              entrySortBy.value = (e.target as any).value
              sortMenuAnchor.value = null
            })}
          >
            <FormControlLabel
              value="date"
              label="Date"
              control={<Radio size="small" />}
            />
            <FormControlLabel
              value="unread"
              label="Unread"
              control={<Radio size="small" />}
            />
          </RadioGroup>
          <FormControlLabel
            className="px-3"
            label="Desc"
            control={
              <Checkbox
                size="small"
                checked={entrySortDesc.value}
                onChange={e => entrySortDesc.value = (e.target as HTMLInputElement).checked}
              />
            }
          />
        </FormControl>
      </Menu>

      {searchMode.value &&
        <div className="flex py-1 px-2">
          <IconButton
            size="small"
            color="inherit"
            title="Cancel"
            onClick={cancelSearch}
          >
            <Icon path={mdiArrowLeft} size={1} />
          </IconButton>
          <TextField
            inputRef={input => input?.focus()}
            variant="standard"
            sx={{ flexGrow: 1 }}
            value={entryTitleFilter.value}
            onChange={(event: any) => {
              entryTitleFilter.value = event.target.value;
            }}
            onKeyDown={handleSearchKeyDown}
            slotProps={{
              input: {
                endAdornment: (
                  entryTitleFilter.value.length > 0 &&
                    <IconButton
                      size="small"
                      onClick={() => entryTitleFilter.value = ""}
                      onMouseDown={preventEventDefault}
                      edge="end"
                    >
                      <Icon path={mdiClose} size={0.9} />
                    </IconButton>
                )
              }
            }}
          />
          <IconButton
            size="small"
            color="inherit"
            title="Search entries by title"
            onClick={handleSearch}
          >
            <Icon path={mdiMagnify} size={1} />
          </IconButton>
        </div>
      }
      {selectMode.value &&
        <div className="py-1 px-2">
          <div className="flex">
            <IconButton
              size="small"
              color="inherit"
              title="Cancel"
              onClick={() => selectMode.value = false}
            >
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
            <span className="pl-2 inline-flex grow items-center font-bold">
              {selectedItems.value.size} selected
            </span>
            <IconButton
              size="small"
              color="inherit"
              title="Clear selection"
              onClick={() => selectedItems.value = immutable.Set()}
            >
              <Icon path={mdiClose} size={1} />
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              title="Select this page"
              onClick={handleSelectPage}
            >
              <Icon path={mdiCheckboxOutline} size={1} />
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              title="Select all"
              onClick={handleSelectAll}
            >
              <Icon path={mdiCheckboxMultipleOutline} size={1} />
            </IconButton>
          </div>

          <div className="flex flex-row-reverse">
            <IconButton
              size="small"
              color="inherit"
              title="Mark as read"
              onClick={() => handleMarkEntries(selectedItems.value, true)}
              disabled={selectedItems.value.size === 0}
            >
              <Icon path={mdiEmailOpenOutline} size={1} />
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              title="Mark as unread"
              onClick={() => handleMarkEntries(selectedItems.value, false)}
              disabled={selectedItems.value.size === 0}
            >
              <Icon path={mdiEmailAlertOutline} size={1} />
            </IconButton>
          </div>
        </div>
      }

      <Divider />

      <List ref={ref} disablePadding sx={{ overflow: "auto", flexGrow: 1 }}>
        {displayedEntries.value.map(e => {
          const entryId = toEntryId(e);
          const feedTitle = getFeedTitle(lookupFeed(e.feed_url));

          return (
            <ListItemButton
              key={entryId}
              onClick={() => {
                if (selectMode.value) {
                  handleSelect(entryId)
                } else {
                  const prev = previousEntry.value
                  if (prev && !fromEntryId(prev)?.user_data.read) {
                    handleMarkEntries(immutable.Set([prev]), true)
                  }

                  previousEntry.value = entryId
                  props.onClick(entryId)
                  updateQueryParams({ entry: entryId })
                }
              }}
              sx={{
                flexDirection: "column",
                justifyContent: "flex-start",
                display: "block",
                py: 1.5
              }}
              selected={isSelected(entryId)}
            >
              <div className="text-sm flex mb-1 font-medium w-full">
                {!e.user_data.read &&
                  <span className="mr-2 opacity-95" title="Unread">
                    <Icon path={mdiCircle} size={0.4} />
                  </span>}
                <span className="inline-flex grow whitespace-nowrap overflow-hidden text-ellipsis opacity-80">
                  {feedTitle}
                </span>
                <span className="opacity-80">
                  {displayDateDiff(getEntryDate(e))}
                </span>
              </div>
              <div>{e.title || "(No Title)"}</div>
            </ListItemButton>
          )
        })}
      </List>
      <Pagination
        size="large"
        sx={{
          margin: "auto", // center pagination
          my: 1.4
        }}
        count={numPages.value}
        siblingCount={0}
        page={currentPage.value}
        onChange={(_, v) => updateQueryParams({ page: v.toString() })}
      />
    </Stack>
	)
})

export default EntryList
