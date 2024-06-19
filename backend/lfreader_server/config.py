from pydantic import BaseModel
import re

class ArchiveOption(BaseModel):
  # attr to arhive the url and rewrite
  attr: str
  # str: regex
  tag_filter: re.Pattern|list[str]|bool = True
  attr_filters: dict[str, re.Pattern|list[str]|bool] = {}

class ArchiverConfig(BaseModel):
  # base dir to store downloaded resources
  base_dir: str = "archives"
  # base url to rewrite for archived resources
  base_url: str = "/archives"
  retry_attempts: int = 5
  # delay in seconds
  retry_delay: int = 5
  archive_options: list[ArchiveOption] = [
    ArchiveOption(attr="src")
  ]

class SwaggerConfig(BaseModel):
  js_url: str = "https://unpkg.com/swagger-ui-dist@5.16.0/swagger-ui-bundle.js"
  css_url: str = "https://unpkg.com/swagger-ui-dist@5.16.0/swagger-ui.css"

class Config(BaseModel):
  db_file: str = "db.sqlite"
  # user agent used to fetch feeds and resources
  user_agent: str | None = None
  # timeout for http requests in seconds
  timeout: int = 10
  log_level: str = "info"
  archiver: ArchiverConfig = ArchiverConfig()
  swagger: SwaggerConfig = SwaggerConfig()

