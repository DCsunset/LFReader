# LFReader
# Copyright (C) 2022-2024  DCsunset

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
import random
import logging
from urllib.request import urlopen, urljoin, Request
from urllib.parse import urlparse
from hashlib import blake2s
from pathlib import Path
import shutil
import asyncio
from yarl import URL
from base64 import urlsafe_b64encode, urlsafe_b64decode
from functools import partial
import os
import re

from .config import ArchiverConfig
from .utils import async_map

"""
Use Base64 (url safe) to encode feed url
"""
def encode_feed_url(feed_url: str) -> str:
  return urlsafe_b64encode(feed_url.encode()).decode().rstrip("=")

def decode_feed_url(encoded: str) -> str:
  # extra padding of 4 is fine
  padding = (4 - len(encoded) % 4) * "="
  return urlsafe_b64decode(encoded + padding).decode()

class Archiver:
  def __init__(self, config: ArchiverConfig):
    self.cfg = config

  """
  Archive all resources in the html content
  and replace the URLs
  """
  async def archive_html(self, session, feed_url: str, content: str, base_url: str | None, user_data: dict):
    soup = BeautifulSoup(content, "html.parser")
    async def update_tag(attr, tag):
      resource_url = await self.archive_resource(session, feed_url, tag.get(attr), base_url, user_data)
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

  async def archive_resource(self, session, feed_url: str, src: str, base_url: str | None, user_data: dict):
    # store in feed-specific dir
    encoded_feed_url = encode_feed_url(feed_url)
    feed_path = Path(self.cfg.base_dir).joinpath(encoded_feed_url)
    feed_path.mkdir(parents=True, exist_ok=True)

    resource_base_url = f"{self.cfg.base_url}/{encoded_feed_url}"
    # check if url is already archived
    if src.startswith(resource_base_url):
      filename = Path(src).name
      # start with 64 hex digit
      if re.match("[0-9a-f]{64}", filename):
        if feed_path.joinpath(filename).exists():
          # already archived
          return None
        # search for file started with it for backward compatibility
        for f in feed_path.iterdir():
          if f.name.startswith(filename):
            return f"{resource_base_url}/{f.name}"
        logging.warn(f"URL archived but resource not found: {src}")
        return None

    url = urljoin(base_url, src)
    base_path = urlparse(url).path
    user_base_url = user_data.get("base_url")
    if user_base_url:
      # remove prefix to always prepend the full user base url
      url = urljoin(user_base_url, base_path.removeprefix("/"))
    digest = blake2s(url.encode()).hexdigest()
    filename = f"{digest}_{Path(base_path).name}"

    resource_path = feed_path.joinpath(filename)
    resource_url = f"{resource_base_url}/{filename}"

    # Check digest first for backward compatibility
    old_resource_path = feed_path.joinpath(digest)
    if old_resource_path.exists():
      os.rename(old_resource_path, resource_path)

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

  def delete_archives(self, feed_urls: list[str]):
    for feed_url in feed_urls:
      encoded_feed_url = encode_feed_url(feed_url)
      feed_path = Path(self.cfg.base_dir).joinpath(encoded_feed_url)
      if feed_path.exists():
        shutil.rmtree(str(feed_path))

