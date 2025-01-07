# LFReader
# Copyright (C) 2022-2025  DCsunset

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

from bs4 import BeautifulSoup
from datetime import datetime
import random
import logging
from urllib.request import urlopen, urljoin, Request
from urllib.parse import urlparse
from hashlib import blake2s
from pathlib import Path
import shutil
import asyncio
from yarl import URL
from functools import partial
import re

from .config import ArchiverConfig
from .utils import async_map, sql_update_field

class Archiver:
  def __init__(self, db, config: ArchiverConfig):
    self.db = db
    self.cfg = config

  def filename_from_url(self, url: str):
    name = Path(url).name
    if url.startswith(self.cfg.base_url) and re.match("[0-9a-f]{64}", name):
      return name
    digest = blake2s(url.encode()).hexdigest()
    return  f"{digest}_{name}"

  """
  Archive all resources in the html content
  and replace the URLs
  """
  async def archive_html(self, session, feed_url: str, entry_id: str, content: str, base_url: str | None, user_data: dict):
    soup = BeautifulSoup(content, "html.parser")
    async def update_tag(attr, tag):
      resource_url = await self.archive_resource(session, feed_url, entry_id, tag.get(attr), base_url, user_data)
      # only update url when archiving succeeds
      if resource_url:
        tag[attr] = resource_url

    for opt in self.cfg.archive_options:
      attrs = opt.attr_filters
      if opt.attr not in attrs:
        attrs[opt.attr] = True
      await async_map(
        partial(update_tag, opt.attr),
        soup.find_all(opt.tag_filter, attrs=attrs),
        user_data.get("archive_sequential", False),
        user_data.get("archive_interval", 0)
      )
    return str(soup)

  async def archive_resource(self, session, feed_url: str, entry_id: str, src: str, base_url: str | None, user_data: dict):
    resource_dir = Path(self.cfg.base_dir)
    # check if url is already archived
    if src.startswith(self.cfg.base_url):
      filename = Path(src).name
      # start with 64 hex digit
      if re.match("[0-9a-f]{64}", filename):
        if resource_dir.joinpath(filename).exists():
          # already archived
          return None
        logging.warn(f"URL archived but resource not found: {src}")
        return None

    url = urljoin(base_url, src)
    base_path = urlparse(url).path
    user_base_url = user_data.get("base_url")
    if user_base_url:
      # remove prefix to always prepend the full user base url
      url = urljoin(user_base_url, base_path.removeprefix("/"))

    filename = self.filename_from_url(url)
    resource_path = resource_dir.joinpath(filename)
    resource_url = f"{self.cfg.base_url}/{filename}"

    # already cached
    if resource_path.exists():
      return resource_url

    # skip blacklisted url (regex)
    archive_blacklist = user_data.get("archive_blacklist")
    if archive_blacklist and re.match(archive_blacklist, url):
      return None

    logging.debug(f'Archiving resources in html {url}...')
    for i in range(self.cfg.retry_attempts):
      try:
        # disable quoting to prevent invalid char in url
        async with session.get(URL(url, encoded=True)) as resp:
          resp.raise_for_status()
          with open(resource_path, "wb") as f:
            async for chunk in resp.content.iter_chunked(10240):
              f.write(chunk)
        # add to resources table
        self.db.execute(
          f'''
          INSERT OR IGNORE INTO resources VALUES (?, ?, ?)
          ''',
          (
            feed_url,
            entry_id,
            url
          )
        )

        return resource_url
      except Exception as e:
        # delete partial downloads to prevent corruption
        resource_path.unlink(missing_ok=True)

        retry_status = "Retrying..." if i != self.cfg.retry_attempts - 1 else "All retries failed."
        logging.warn(f"Failed to fetch resource from {url} ({user_base_url}, {base_url}, {src}): {type(e).__name__}: {str(e)}")
        if i != self.cfg.retry_attempts - 1:
          logging.info(f"Retrying to fetch resource from {url} ({user_base_url}, {base_url}, {src})...")
          await asyncio.sleep(
            self.cfg.retry_delay + random.randrange(self.cfg.retry_delay)
          )
        else:
          logging.warn(f"Failed to fetch resource from {url} ({user_base_url}, {base_url}, {src}): All retries failed.")

    return None

  # archive logo from website
  async def archive_logo(self, session, feed_url: str, url: str):
    # TODO
    return None

  # Delete resources (need to commit after calling this function)
  def delete_resources(self, feed_url: str, entry_id: str | None = None):
    cur = self.db.cursor()
    query_condition = "feed_url = ?"
    args = [feed_url]
    if entry_id is not None:
      query += "AND entry_id = ?"
      args.append(entry_id)

    # keep track of deleted resources
    resources = list(map(
      lambda r: r["url"],
      cur.execute(f"SELECT DISTINCT url FROM resources WHERE {query_condition}", args)
    ))

    cur.execute(f"DELETE FROM resources WHERE {query_condition}", args)

    resource_dir = Path(self.cfg.base_dir)
    for url in resources:
      # short-circuit when it exists
      r = cur.execute(
        "SELECT EXISTS (SELECT 1 FROM resources WHERE url = ?) AS 'ok'",
        (url,)
      ).fetchone()
      # delete resource if no reference
      if r['ok'] == 0:
        resource_path = resource_dir.joinpath(self.filename_from_url(url))
        logging.debug(f"Deleting resource {resource_path}...")
        resource_path.unlink(missing_ok=True)

