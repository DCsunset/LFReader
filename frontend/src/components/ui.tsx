// LFReader
// Copyright (C) 2022-2026  DCsunset

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

import { splitProps } from "solid-js"
import { concatClasses } from "../util/css"
import { Dynamic } from "solid-js/web"
import { Select } from "@thisbeyond/solid-select"

export function IconButton(props: {
  component?: any,
  class?: string,
  [prop: string]: any,
}) {
  const [localProps, restProps] = splitProps(props, ["component", "class"])
  const component = localProps.component || "button"

  return (
    <Dynamic
      component={component}
      class={concatClasses([
        "d-btn",
        "d-btn-ghost",
        "d-btn-circle",
        "hover:bg-base-content/10",
        "border-none",
        localProps.class
      ])}
      {...restProps}
    />
  )
}

export function TextButton(props: {
  component?: any,
  class?: string,
  color?: string,
  disabled?: boolean,
  loading?: boolean,
  children: any,
  [prop: string]: any,
}) {
  const [localProps, restProps] = splitProps(props, ["component", "class", "color", "disabled", "loading", "children"])
  const color = () => localProps.color ?? "base-content"
  const component = localProps.component || "button"

  // TODO: fix color
  return (
    <Dynamic
      component={component}
      class={concatClasses([
        "d-btn",
        "d-btn-ghost",
        "border-none",
        localProps.class,
        {
          [`hover:bg-${color()}/10`]: !localProps.disabled,
          [`text-${color()}`]: !localProps.disabled,
          "d-btn-disabled": Boolean(localProps.disabled),
        }
      ])}
      {...restProps}
    >
      {localProps.loading
        ? <span class="loading loading-spinner loading-sm" />
        : <>
            {localProps.children}
          </>
      }
    </Dynamic>
  )
}


export function MultiSelect(props: {
  class?: string,
  [prop: string]: any,
}) {
  const [localProps, restProps] = splitProps(props, ["class"])

  return (
    <Select
      class={concatClasses([
        localProps.class,
        "[&_.solid-select-list]:text-sm",
        "[&_.solid-select-list]:!bg-base-300",
        "!bg-base-100",
        "[&_.solid-select-control]:not-focus-within:!border-base-content/20",
        "[&_.solid-select-multi-value]:!bg-base-300",
        "[&_.solid-select-option[data-focused='true']]:!bg-base-200",
        "[&_.solid-select-option]:hover:!bg-base-100",
      ])}
      multiple
      {...(restProps as any)}
    />
  )
}

