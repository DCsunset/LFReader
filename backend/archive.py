from bs4 import BeautifulSoup
import logging
from urllib.request import urlopen, urljoin, Request
from hashlib import blake2s
from pathlib import Path
import shutil
import asyncio
from base64 import urlsafe_b64encode, urlsafe_b64decode

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
  def __init__(self, archive_dir: str, archive_url: str):
    self.archive_dir = archive_dir
    self.archive_url = archive_url

  """
  Archive all resources in the html content
  and replace the URLs
  """
  async def archive_html(self, session, feed_url: str, content: str, base_url: str | None):
    soup = BeautifulSoup(content, "html.parser")
    async def update_tag(tag):
      tag["src"] = await self.archive_resource(session, feed_url, tag.get("src"), base_url)
    # Find all tags with src attr
    await asyncio.gather(
      *map(
        update_tag,
        soup.find_all(src=True)
      )
    )
    return str(soup)

  async def archive_resource(self, session, feed_url: str, src: str, base_url: str | None):
    # store in feed-specific dir
    encoded_feed_url = encode_feed_url(feed_url)
    feed_path = Path(self.archive_dir).joinpath(encoded_feed_url)
    feed_path.mkdir(parents=True, exist_ok=True)

    url = urljoin(base_url, src)
    digest = blake2s(url.encode()).hexdigest()
    resource_path = feed_path.joinpath(digest)
    resource_url = f"{self.archive_url}/{encoded_feed_url}/{digest}"
    # already cached
    if resource_path.exists():
      return resource_url

    try:
      async with session.get(url) as resp:
        if resp.status != 200:
          raise Exception(f"http error {resp.status}")
        with open(resource_path, "wb") as f:
          async for chunk in resp.content.iter_chunked(10240):
            f.write(chunk)
      return resource_url
    except Exception as e:
      logging.warn(f"Fail to fetch resource from {url} ({base_url}, {src}): {str(e)}")
      return None

  # archive logo from website
  async def archive_logo(self, session, feed_url: str, url: str):
    # TODO
    return None

  def delete_archives(self, feed_urls: list[str]):
    for feed_url in feed_urls:
      encoded_feed_url = encode_feed_url(feed_url)
      feed_path = Path(self.archive_dir).joinpath(encoded_feed_url)
      if feed_path.exists():
        shutil.rmtree(str(feed_path))

