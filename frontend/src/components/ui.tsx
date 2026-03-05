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

export function IconButton(props: any) {
  const [localProps, restProps] = splitProps(props, ["class"])

  return (
    <button
      class={`d-btn d-btn-ghost d-btn-circle hover:bg-base-content/10 border-none ${localProps.class}`}
      {...restProps}
    />
  )
}

export function TextButton(props: {
  class?: string,
  color?: string,
  [prop: string]: any,
}) {
  const [localProps, restProps] = splitProps(props, ["class", "color", "disabled"])
  const color = () => localProps.color ?? "base-content"

  // TODO: fix color
  return (
    <button
      class={concatClasses([
        "d-btn",
        "d-btn-ghost",
        "border-none",
        localProps.class,
        {
          [`hover:bg-${color()}/10`]: !localProps.disabled,
          [`text-${color()}`]: !localProps.disabled,
          "d-btn-disabled": localProps.disabled,
        }
      ])}
      {...restProps}
    />
  )
}


