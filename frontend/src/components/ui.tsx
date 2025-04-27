// LFReader
// Copyright (C) 2025  DCsunset

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

export function IconButton(props: any) {
  const [localProps, restProps] = splitProps(props, ["class"])
  return (
    // Must set children to block to prevent extra gap from verticle-align
    <button class={`*:block shadow-none bg-inherit border-none rounded-full transition-all hover:bg-white/25 hover:cursor-pointer ${localProps.class}`} {...restProps} />
  )
}

