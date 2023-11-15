from bs4 import BeautifulSoup
import logging
from urllib.request import urlopen, urljoin, Request
from hashlib import blake2s
from pathlib import Path
import asyncio

class Archiver:
  def __init__(self, archive_dir: str, archive_url: str):
    self.archive_dir = archive_dir
    self.archive_url = archive_url

  """
  Archive all resources in the html content
  and replace the URLs
  """
  async def archive_html(self, session, content: str, base_url: str | None):
    soup = BeautifulSoup(content, "html.parser")
    async def update_tag(tag):
      tag["src"] = await self.archive_resource(session, tag.get("src"), base_url)
    # Find all tags with src attr
    await asyncio.gather(
      *map(
        update_tag,
        soup.find_all(src=True)
      )
    )
    return str(soup)

  async def archive_resource(self, session, src: str, base_url: str | None):
    url = urljoin(base_url, src)
    digest = blake2s(url.encode()).hexdigest()
    resource_path = Path(self.archive_dir).joinpath(digest)
    resource_url = urljoin(self.archive_url, digest)
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
  async def archive_logo(self, session, url: str):
    # TODO
    return None

