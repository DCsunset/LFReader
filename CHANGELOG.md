# Changelog

All notable changes to this project will be documented in this file.

## [4.0.6] - 2026-04-22

### 🐛 Bug Fixes

- *(frontend)* Add back confirm dialog for risky operations
- *(frontend)* Add opacity to frozen feeds

## [4.0.5] - 2026-04-21

### 🐛 Bug Fixes

- *(backend)* Fix foreign key constraint error when archiving
- *(backend)* Exclude placeholder entry
- *(frontend)* Fix button layout in settings
- *(frontend)* Fix spacing and tags setting item
- *(frontend)* Fix media playback rates

### ⚙️ Miscellaneous Tasks

- *(release)* V4.0.5

## [4.0.4] - 2026-04-17

### 🐛 Bug Fixes

- *(frontend)* Fix loading state for text button

### ⚙️ Miscellaneous Tasks

- *(release)* V4.0.4

## [4.0.3] - 2026-04-15

### 🐛 Bug Fixes

- *(backend)* Fix variable scope

### ⚙️ Miscellaneous Tasks

- *(release)* V4.0.3

## [4.0.2] - 2026-04-13

### 🐛 Bug Fixes

- *(frontend)* Add missing swipe gesture support

### ⚙️ Miscellaneous Tasks

- *(release)* V4.0.2

## [4.0.1] - 2026-04-13

### 🐛 Bug Fixes

- *(frontend)* Remove unused import

### 💼 Other

- Fix dockerfile

### ⚙️ Miscellaneous Tasks

- *(release)* V4.0.1

## [4.0.0] - 2026-04-12

### 🚀 Features

- *(frontend)* [**breaking**] Switch to solid.js framework
- *(backend)* [**breaking**] Support updating feed url
- *(frontend)* Add ui for editing feed url
- *(backend)* [**breaking**] Update foreign key constraints and add placeholder entry

### 🐛 Bug Fixes

- *(frontend)* Fix entry ui styles
- *(frontend)* Fix text button color
- *(frontend)* Fix style
- *(frontend)* Rename constants file

### 🚜 Refactor

- *(frontend)* Migrate app bar and ui component
- *(frontend)* Switch to daisyUI and tailwindcss
- *(frontend)* Migrate responsive layout for different screen sizes
- *(frontend)* Migrate app state and feed list
- *(frontend)* Fix state persistence
- *(frontend)* Migrate entry list and fix some styles
- *(frontend)* Migrate entry and fix styles
- *(frontend)* Fix some bugs and functionality
- *(frontend)* Implement feed dialog and fix layout
- *(frontend)* Add NewFeedDialog
- *(frontend)* Add SettingsDialog
- *(frontend)* Add AboutDialog and implement more toolbar buttons
- *(frontend)* Add dark theme support

### ⚙️ Miscellaneous Tasks

- *(frontend)* Reset tsconfig.json
- *(flake)* Update flake inputs
- *(flake)* Update inputs
- *(frontend)* Update dependencies
- *(flake)* Update inputs
- Add migration script and doc
- Fix release script
- *(release)* V4.0.0

## [3.5.1] - 2025-04-26

### 🐛 Bug Fixes

- *(frontend)* Enable read/unread action only when necessary

### ⚡ Performance

- *(frontend)* Separate entry content from metadata to reduce page update
- *(frontend)* Improve entry list for small device

### ⚙️ Miscellaneous Tasks

- *(release)* V3.5.1

## [3.5.0] - 2025-04-24

### 🚀 Features

- Support freezing feeds

### 🐛 Bug Fixes

- *(frontend)* Improve scrolling on small device
- *(frontend)* Fix feed list spacing

### ⚙️ Miscellaneous Tasks

- *(release)* V3.5.0

## [3.4.2] - 2025-04-23

### 🐛 Bug Fixes

- *(frontend)* Fix title display

### ⚙️ Miscellaneous Tasks

- *(release)* V3.4.2

## [3.4.1] - 2025-04-23

### 🚀 Features

- *(frontend)* Allow scrolling entry list when dbl clicking app bar

### 🐛 Bug Fixes

- *(frontend)* Fix read/unread icons
- *(frontend)* Set sort desc to true by default
- *(frontend)* Add current entry to selection only if it exists
- *(frontend)* Update unread icon and position

### ⚙️ Miscellaneous Tasks

- Allow specifying version when releasing
- *(release)* V3.4.1

## [3.4.0] - 2025-04-23

### 🚀 Features

- *(frontend)* Support long polling to reload data from server
- Support read/unread state tracking and setting
- *(frontend)* Support sorting by unread or date
- *(frontend)* Add link anchor next to entry title

### 🐛 Bug Fixes

- *(backend)* Fix base_url when link url is not full url
- *(frontend)* Fix overflow styling
- *(backend)* Try feed link as base_url first
- *(frontend)* Open selected entry on startup for small screen
- *(frontend)* Do not trigger swiping on scrollable element
- *(frontend)* Use signal for device size for better transition
- *(frontend)* Select current entry by default

### 💼 Other

- Maintain update date to avoid unnecessary data fetching

### ⚙️ Miscellaneous Tasks

- *(flake)* Update inputs
- *(frontend)* Update packages
- Switch to git-cliff to bump version
- *(release)* V3.4.0

## [3.3.3] - 2025-02-05

### 🐛 Bug Fixes

- *(frontend)* Scroll to entry list top on page change
- *(frontend)* Fix overflowing entry when hidden

### ⚙️ Miscellaneous Tasks

- *(release)* 3.3.3

## [3.3.2] - 2025-02-05

### 🐛 Bug Fixes

- *(frontend)* Fix svg max width
- *(frontend)* Fix scrolling and use double-click for scroll-to-top

### 📚 Documentation

- *(frontend)* Add tips to about dialog

### ⚙️ Miscellaneous Tasks

- *(release)* 3.3.2

## [3.3.1] - 2025-01-17

### 🐛 Bug Fixes

- *(backend)* Fix pyproject package

### ⚙️ Miscellaneous Tasks

- *(backend)* Remove executable permission of lookup script
- *(release)* 3.3.1

## [3.3.0] - 2025-01-17

### 🚀 Features

- *(backend)* Add cli package for lfreader_lookup

### 🐛 Bug Fixes

- *(frontend)* Only trigger touch event when x distance is larger
- *(frontend)* Add api to pwa workbox fallback deny list
- *(frontend)* Fix adding new feeds
- *(frontend)* Fix entry rendering

### 💼 Other

- Remove fenix
- Add script to lookup resource

### 📚 Documentation

- Update readme

### ⚙️ Miscellaneous Tasks

- *(release)* 3.3.0

## [3.2.0] - 2025-01-09

### 🚀 Features

- *(frontend)* Support cleaning feeds

### 🐛 Bug Fixes

- *(frontend)* Show description only if not empty
- *(backend)* Fix clean_feeds

### ⚙️ Miscellaneous Tasks

- *(backend)* Improve logging info
- *(release)* 3.2.0

## [3.1.2] - 2025-01-09

### 🐛 Bug Fixes

- *(backend)* Try adding resource to db even if it is found
- *(backend)* Commit tx for every feed for better fault tolerance

### ⚙️ Miscellaneous Tasks

- *(release)* 3.1.2

## [3.1.1] - 2025-01-09

### 🐛 Bug Fixes

- *(backend)* Fix feed url variable

### ⚙️ Miscellaneous Tasks

- *(release)* 3.1.1

## [3.1.0] - 2025-01-09

### 🚀 Features

- *(backend)* Support archiving logo

### 🐛 Bug Fixes

- *(backend)* [**breaking**] Fix resource naming to avoid long filenames
- *(scripts)* Fix migration scripts

### 📚 Documentation

- Update README

### ⚙️ Miscellaneous Tasks

- *(release)* 3.1.0

## [3.0.0] - 2025-01-08

### 🚀 Features

- *(backend)* [**breaking**] Add resources table and update schema
- *(frontend)* Update schema and add generator info
- *(backend)* [**breaking**] Use flat structure for resources
- *(backend)* Implement resource deletion
- *(frontend)* Refactor code and add category info

### 🐛 Bug Fixes

- *(backend)* Fix a few bugs

### 💼 Other

- Add script to migrate to v3

### 🚜 Refactor

- [**breaking**] Refactor api endpoints

### 📚 Documentation

- Update screenshots and add migration note

### ⚙️ Miscellaneous Tasks

- *(release)* 3.0.0

## [2.10.2] - 2025-01-02

### 🐛 Bug Fixes

- *(backend)* Fix entry link processing
- *(frontend)* Add feed description
- *(frontend)* Fix entries when filtered by tag

### ⚙️ Miscellaneous Tasks

- *(release)* 2.10.2

## [2.10.1] - 2024-12-19

### 🐛 Bug Fixes

- *(frontend)* Improve description of adding tags
- *(frontend)* Fix query params encoding & improve ui

### ⚙️ Miscellaneous Tasks

- *(release)* 2.10.1

## [2.10.0] - 2024-12-19

### 🚀 Features

- *(frontend)* Support swiping to toggle feed and entry lists
- *(frontend)* Group feeds by tags in feed list
- *(frontend)* Support adding tags for feeds and fix some styles

### 🐛 Bug Fixes

- *(frontend)* Make background color same as theme color
- *(frontend)* Stop propagation after clicking edit icon
- *(frontend)* Optimize scroll event on entry

### 🚜 Refactor

- *(frontend)* Reuse settings item in dialogs

### ⚙️ Miscellaneous Tasks

- Remove unnecessary version and fix versionrc
- *(release)* 2.10.0

## [2.9.1] - 2024-12-09

### 🐛 Bug Fixes

- *(frontend)* Fix error notification and about dialog

### ⚙️ Miscellaneous Tasks

- *(frontend)* Fix version
- *(release)* 2.9.1

## [2.9.0] - 2024-12-08

### 🚀 Features

- *(frontend)* Init tauri android
- *(frontend)* Allow setting api base url and fix error handling
- *(frontend)* Support setting default playback rate
- *(frontend)* Add about dialog and version info
- *(frontend)* Support basic auth for api
- *(frontend)* Support PWA

### 🐛 Bug Fixes

- *(frontend)* Reset sate after closing settings dialog
- *(frontend)* Open feed url in new tab
- *(backend)* Add cors middleware to support standalone api server
- *(frontend)* Fix overflow in new feeds dialog
- *(frontend)* Improve snackbar ui
- Improve error formatting
- *(frontend)* Fix api docs url

### 💼 Other

- Update inputs
- Add dev env for tauri android
- *(frontend)* Update android icons
- Add scripts to sign apk

### 🚜 Refactor

- *(frontend)* Use stack for settings and refactor layout
- *(frontend)* Remove android support due to cors issue

### 📚 Documentation

- Add signing instruction for android

### ⚙️ Miscellaneous Tasks

- Add version bumper for frontend
- Add apk to gitignore
- Add version to package.json and update bumper
- *(release)* 2.9.0

### ◀️ Revert

- *(frontend)* Remove support for external api endpoint

## [2.8.4] - 2024-11-25

### 🐛 Bug Fixes

- *(frontend)* Fix fetching data

### ⚙️ Miscellaneous Tasks

- *(release)* 2.8.4

## [2.8.3] - 2024-11-25

### 🐛 Bug Fixes

- *(backend)* Handle errors in task runner

### ⚙️ Miscellaneous Tasks

- *(release)* 2.8.3

## [2.8.2] - 2024-11-18

### 🐛 Bug Fixes

- *(backend)* Fix loading state and async task runner

### ⚙️ Miscellaneous Tasks

- *(release)* 2.8.2

## [2.8.1] - 2024-10-29

### 🐛 Bug Fixes

- *(frontend)* Fix entry list highlighting

### ⚙️ Miscellaneous Tasks

- *(release)* 2.8.1

## [2.8.0] - 2024-10-28

### 🚀 Features

- *(backend)* Run time-consuming tasks in background
- *(frontend)* Use polling get status from backend for some tasks
- *(backend)* [**breaking**] Support more query parameters for getting entries
- *(frontend)* [**breaking**] Load entry content on demand

### 🐛 Bug Fixes

- *(frontend)* Move volume control to the end

### ⚙️ Miscellaneous Tasks

- *(frontend)* Update deps
- *(release)* 2.8.0

## [2.7.4] - 2024-09-08

### 🐛 Bug Fixes

- *(frontend)* Allow setting custom playback rates

### ⚙️ Miscellaneous Tasks

- *(release)* 2.7.4

## [2.7.3] - 2024-09-05

### 🐛 Bug Fixes

- *(frontend)* Add more playback rates and disable selection for media

### ⚙️ Miscellaneous Tasks

- *(release)* 2.7.3

## [2.7.2] - 2024-09-02

### 🐛 Bug Fixes

- *(frontend)* Allow scrolling when media player overflows

### ⚙️ Miscellaneous Tasks

- *(release)* 2.7.2

## [2.7.1] - 2024-09-01

### 🐛 Bug Fixes

- *(frontend)* Remove redundant number in entry

### ⚙️ Miscellaneous Tasks

- *(release)* 2.7.1

## [2.7.0] - 2024-09-01

### 🚀 Features

- *(frontend)* Add unocss
- *(frontend)* Add custom media player for better controls
- *(frontend)* Use media-chrome as media player

### 🐛 Bug Fixes

- *(frontend)* Add title to media control buttons
- *(frontend)* Update dependencies and fix some styles

### 🚜 Refactor

- *(frontend)* Enable strict type check

### ⚙️ Miscellaneous Tasks

- *(release)* 2.7.0

## [2.6.3] - 2024-08-25

### 🐛 Bug Fixes

- *(backend)* Fix timeout config and improve error logging

### ⚙️ Miscellaneous Tasks

- *(release)* 2.6.3

## [2.6.2] - 2024-08-24

### 🐛 Bug Fixes

- *(backend)* Delete partial download to prevent propagating corruption
- *(frontend)* Remove redundant type definition
- *(frontend)* Allow switching feed in editing mode
- *(frontend)* Fix link rewrite by allowing local links with hash
- *(frontend)* Move delete action to feed settings

### 📚 Documentation

- Add feed formats in readme

### ⚙️ Miscellaneous Tasks

- *(release)* 2.6.2

## [2.6.1] - 2024-08-12

### 🐛 Bug Fixes

- *(frontend)* Show entry list when clicking on a feed
- *(frontend)* Adjust font size and fix text overflow

### ⚙️ Miscellaneous Tasks

- *(release)* 2.6.1

## [2.6.0] - 2024-08-11

### 🚀 Features

- *(frontend)* Allow fetching individual feeds

### 🐛 Bug Fixes

- *(frontend)* Fix responsive style for entry list
- *(frontend)* Fix feed list width on small screen
- *(frontend)* Fix responsive ui for small screen

### 📚 Documentation

- Add responsive ui to feature list

### ⚙️ Miscellaneous Tasks

- *(release)* 2.6.0

## [2.5.0] - 2024-08-09

### 🚀 Features

- *(backend)* Support archiving sequentially and add interval
- *(frontend)* Add UI for archive sequential and interval config
- *(backend)* Support add entries after specific_date
- *(frontend)* Support afterDate option

### 🐛 Bug Fixes

- *(backend)* Fix url quoting in aiohttp

### ⚙️ Miscellaneous Tasks

- *(release)* 2.5.0

## [2.4.0] - 2024-08-08

### 🚀 Features

- *(frontend)* Support display enclosures
- *(backend)* Support archiving enclosures
- *(frontend)* Add button to add feed url

### 🐛 Bug Fixes

- *(frontend)* Display server added date if other dates unavailable

### ⚙️ Miscellaneous Tasks

- *(release)* 2.4.0

## [2.3.0] - 2024-08-01

### 🚀 Features

- *(backend)* Support ignoring errors when fetching feeds
- *(frontend)* Ignore errors when updating all feeds
- *(frontend)* Support jump to local entries and fix style

### ⚙️ Miscellaneous Tasks

- Update flake inputs
- *(release)* 2.3.0

## [2.2.3] - 2024-07-31

### 🐛 Bug Fixes

- *(backend)* Use same session to get feed and improve error handling
- *(frontend)* Disable feed input when fetching data

### ⚙️ Miscellaneous Tasks

- Add direnv and pylsp for devShell
- *(release)* 2.2.3

## [2.2.2] - 2024-07-13

### 🐛 Bug Fixes

- *(backend)* Fix access to attribute

### ⚙️ Miscellaneous Tasks

- *(release)* 2.2.2

## [2.2.1] - 2024-07-11

### 🐛 Bug Fixes

- Fix config in docker image

### ⚙️ Miscellaneous Tasks

- *(release)* 2.2.1

## [2.2.0] - 2024-07-10

### 🚀 Features

- Support archiving specified feeds
- *(frontend)* Support confirmation on external link
- Allow blacklisting url when archiving
- Support setting user_data when adding new feeds
- *(frontend)* Support searching entries by title

### ⚙️ Miscellaneous Tasks

- *(frontend)* Update dependencies
- *(frontend)* Remove unused field in package.json
- *(release)* 2.2.0

## [2.1.6] - 2024-06-28

### 🐛 Bug Fixes

- *(frontend)* Fix title display
- *(backend)* Avoid overwriting content when skipping archiving

### ⚙️ Miscellaneous Tasks

- *(backend)* Improve logging message
- *(release)* 2.1.6

## [2.1.5] - 2024-06-24

### 🐛 Bug Fixes

- *(backend)* Fix url resolution

### 📚 Documentation

- Update nixos config example

### ⚙️ Miscellaneous Tasks

- *(release)* 2.1.5

## [2.1.4] - 2024-06-22

### 🐛 Bug Fixes

- *(backend)* Fix outdated resource url when archiving db

### ⚙️ Miscellaneous Tasks

- *(frontend)* Update dev config
- *(release)* 2.1.4

## [2.1.3] - 2024-06-22

### 🐛 Bug Fixes

- *(backend)* Fix entry link when archiving db

### ⚙️ Miscellaneous Tasks

- *(release)* 2.1.3

## [2.1.2] - 2024-06-22

### 🐛 Bug Fixes

- *(backend)* Fix resource base url

### ⚙️ Miscellaneous Tasks

- *(release)* 2.1.2

## [2.1.1] - 2024-06-22

### 🐛 Bug Fixes

- *(backend)* Fix archive base url

### ⚙️ Miscellaneous Tasks

- *(release)* 2.1.1

## [2.1.0] - 2024-06-22

### 🚀 Features

- *(backend)* Support archiving feeds in db
- *(frontend)* Add button to archive db
- *(frontend)* Add loading state in ui
- *(frontend)* Display author if it exists

### 🐛 Bug Fixes

- *(frontend)* Fix local state when deleting feed

### ⚙️ Miscellaneous Tasks

- *(release)* 2.1.0

## [2.0.0] - 2024-06-19

### 🚀 Features

- *(backend)* Append filename to resource hash
- *(backend)* [**breaking**] Read config from file and support archiving other tags

### 📚 Documentation

- Update readme and comments

### ⚙️ Miscellaneous Tasks

- Update gitignore
- *(release)* 2.0.0

## [1.4.3] - 2024-05-30

### 💼 Other

- Sort by updated_at when published_at is not available
- Add button to open api docs

### ⚙️ Miscellaneous Tasks

- *(release)* 1.4.3

## [1.4.2] - 2024-04-20

### 🐛 Bug Fixes

- *(frontend)* Fix entryId encoding to allow spaces in url

### ⚙️ Miscellaneous Tasks

- *(release)* 1.4.2

## [1.4.1] - 2024-04-20

### 🐛 Bug Fixes

- *(backend)* Fix annotated type for openapi

### ⚙️ Miscellaneous Tasks

- Update dependency version
- Ignore swagger ui assets
- *(release)* 1.4.1

## [1.4.0] - 2024-04-18

### 🚀 Features

- *(backend)* Support self-hosting swagger ui

### ⚙️ Miscellaneous Tasks

- *(release)* 1.4.0

## [1.3.2] - 2024-04-18

### 🐛 Bug Fixes

- *(backend)* Log error before raising exception
- *(backend)* Don't raise exception for parser error

### ⚙️ Miscellaneous Tasks

- *(release)* 1.3.2

## [1.3.1] - 2024-04-17

### 🐛 Bug Fixes

- *(backend)* Log error message when failing to parse feed
- Raise feed parsing error and fix error format
- *(backend)* Support retrying when failed to fetch resource

### ⚙️ Miscellaneous Tasks

- *(release)* 1.3.1

## [1.3.0] - 2024-03-15

### 🚀 Features

- *(frontend)* Add more info in feed dialog and fix some icons
- Support forceArchive option to skip hash check

### ⚡ Performance

- *(frontend)* Processing entry content only on change

### ⚙️ Miscellaneous Tasks

- Add migration script and instructions
- *(release)* 1.3.0

## [1.2.0] - 2024-03-15

### 🚀 Features

- *(backend)* [**breaking**] Add new data to db and use hash to skip processed content

### 📚 Documentation

- Add installation instruction for Nix

### ⚙️ Miscellaneous Tasks

- *(release)* 1.2.0

## [1.1.0] - 2024-03-14

### 🚀 Features

- *(backend)* Add timeout and log level config

### ⚙️ Miscellaneous Tasks

- *(release)* 1.1.0

## [1.0.4] - 2024-03-12

### 🐛 Bug Fixes

- *(backend)* Fix backend dependencies

### ⚙️ Miscellaneous Tasks

- *(release)* 1.0.4

## [1.0.3] - 2024-03-12

### 🐛 Bug Fixes

- *(backend)* Auto create parent dir for sqlite db

### ⚙️ Miscellaneous Tasks

- *(release)* 1.0.3

## [1.0.2] - 2024-03-12

### 💼 Other

- Add pyproject config and entry point
- Update docker start script

### 🚜 Refactor

- *(backend)* Move files to lfreader_server module

### 📚 Documentation

- Add badges in readme
- Add more instructions for installation and development

### ⚙️ Miscellaneous Tasks

- Add step to update repo description
- *(release)* 1.0.2

## [1.0.1] - 2024-03-11

### 💼 Other

- Use venv for docker build

### ⚙️ Miscellaneous Tasks

- *(release)* 1.0.1

## [1.0.0] - 2024-03-11

### 🚀 Features

- *(backend)* Add basic backend code
- *(backend)* Set logging level and add db path config
- *(frontend)* Add frontend framework
- *(frontend)* Add mui framework and fonts
- *(backend)* [**breaking**] Use FastAPI in place of Flask
- *(backend)* Improve error handling
- *(backend)* Add option to disable OpenAPI and docs
- *(frontend)* Add type definition for feeds
- *(frontend)* Use Recoil for state management
- *(frontend)* Add basic layout and notification
- *(frontend)* Add icon
- *(frontend)* Add actions to fetch data
- *(frontend)* Add responsive drawer
- *(frontend)* Add drawer layout
- *(frontend)* Update logo
- *(frontend)* Add proxy and change url for api
- *(frontend)* Support fetching icon from url
- *(frontend)* Show list of feeds with icons
- *(backend)* Support tags for feed
- *(backend)* Add tags to returned feeds
- *(frontend)* Add feed list of different tags
- *(frontend)* Add title state
- *(frontend)* Add react router
- *(frontend)* Add tag `All` and num of feeds in each tag
- *(backend)* Add feed query args
- *(frontend)* Add feed query params
- *(frontend)* Add grid layout and entry components
- *(frontend)* Use swr to fetch data
- *(frontend)* Add loading component to center the progress bar
- *(frontend)* Fetch entries in EntryListLayout and add entry to route
- *(frontend)* Add scroll bar to entry list and fix layout height
- *(frontend)* Display entry content
- *(frontend)* Hide list for tag All
- *(frontend)* Adjust styles of entry content
- *(frontend)* Add code highlighting
- *(frontend)* Adjust qoute and code style
- *(frontend)* Add entry date and feed title
- *(frontend)* Improve responsive layout and allow toggling entry list
- *(frontend)* Add update button
- Use flake to manage dependencies
- Add delete api and fix some bugs and return types
- *(frontend)* Add FeedList and proxy for dev server
- *(frontend)* Add entry list
- *(backend)* Store summary details and support updating all feeds
- *(frontend)* Add entry content page
- *(frontend)* Fix queryParams and improve UI
- *(backend)* Add archiver to download resources
- *(backend)* [**breaking**] Store resources in feed-specific dir and support deletion
- *(frontend)* Refactor api and state and add update action
- *(frontend)* Add FeedsDialog to add new feeds
- *(frontend)* Add clickable links for feed and entry in app bar
- *(backend)* Sort entries by updated_at and support offset and limit
- *(frontend)* Add pagination
- *(frontend)* Add highlight.js to highlight code
- Display published date and improve styles
- Add scroll-to-top button for entry
- *(backend)* Support setting base_url in user_data
- *(frontend)* Support deleting feeds
- *(backend)* Add update_feed api and fix some bugs
- *(frontend)* Support editing feed's user_data and fix some bugs
- *(frontend)* Support math formula and optimize rendering
- Add option to disable archiving
- *(frontend)* Add more info for entry and improve UI
- *(frontend)* Improve UI for feed list
- *(frontend)* Support setting alias for feeds
- *(frontend)* Add feed title to entry page

### 🐛 Bug Fixes

- *(backend)* Support multi-threading
- *(backend)* Add handler for decoding error
- *(backend)* Exclude unnecessary fields in response
- *(backend)* Update encoder to include feed_url
- *(frontend)* Fix default drawer state and drawer mounting
- *(backend)* Use url-safe id decoding
- *(frontend)* Encode feed id
- *(backend)* Fix data processing and encoding
- *(frontend)* Fix feed types and add tag operations
- *(backend)* Makes feed args optional
- *(backend)* Fix query params
- *(frontend)* Fix route params and use recoil for feeds
- *(frontend)* Use Base64 to encode feedUrl in routes
- *(frontend)* Optimize link and img tag
- *(frontend)* Adjust styles of loading and divider
- *(backend)* Fix update api
- *(frontend)* Fix delete and update api
- *(docker)* Update env variables
- Refactor api and fix table structure and update
- *(frontend)* Fix layout and add queryParams to state
- *(backend)* Fix getEntries sql query
- *(backend)* Remove archive dir only if it exists
- *(frontend)* Fix ui styles and display issues
- Fix api and improve ui styles
- *(backend)* Sort entries by published_at
- *(frontend)* Open links in entry in external page
- *(frontend)* Fix frontend styles
- *(backend)* Fix delete api
- *(frontend)* Fix entry content
- *(frontend)* Fix code rendering and styles
- *(frontend)* Suppress hljs warning
- *(frontend)* Fix some bugs and add anchor for feed title
- *(frontend)* Fix video overflow
- *(frontend)* Fix a typo
- *(backend)* Change default config
- *(backend)* Fix date parsing
- *(backend)* Fix some bugs
- Fix docker build and other bugs

### 💼 Other

- Add container build
- Init storage structure and basic apis
- Add Dockerfile

### 🚜 Refactor

- *(backend)* Improve error handling
- *(backend)* Use fastapi's json encoder
- *(backend)* [**breaking**] Optimize backend api and remove url encoding
- *(frontend)* [**breaking**] Update actions based on backend api
- *(frontend)* [**breaking**] Refactor using preact
- *(backend)* Add get_all api and refactor update api
- Extract entry to a separate component

### 📚 Documentation

- *(backend)* Add usage
- *(backend)* Add docs for db path
- *(backend)* Update README
- Rename app to lfreader and add README
- Update copyright notice
- Update readme and add screenshots

### ⚡ Performance

- *(frontend)* Optimize feed lookup

### ⚙️ Miscellaneous Tasks

- *(backend)* Add db file to gitignore
- *(frontend)* Remove default styles and logo
- *(frontend)* Bump dependency versions
- *(backend)* Add sqlite3 temp files to gitignore
- *(backend)* Fix a typo in code
- Add docker image build
- Update flake command
- *(frontend)* Update dependencies
- Update github action
- Add versionrc
- *(release)* 1.0.0

<!-- generated by git-cliff -->
