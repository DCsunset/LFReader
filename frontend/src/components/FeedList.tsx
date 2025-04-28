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

import { For } from "solid-js"
import ChevronDownIcon from "lucide-solid/icons/chevron-down"


function FeedGroup(props: {
  // _all means all feeds, _none means without tag
  tag: string
}) {
  return (
    <span>Tag</span>
  )
}

export default function FeedList(props: any) {
  const tags = () => [ "_all", "_none" ]
  return (
    <div {...props}>
      <For each={tags()}>
        {(tag, _index) => (
          <FeedGroup tag={tag} />
        )}
      </For>
    </div>
  )
}

