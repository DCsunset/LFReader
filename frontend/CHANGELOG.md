# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.9.0](https://github.com/DCsunset/LFReader/compare/v2.8.4...v2.9.0) (2024-12-08)


### Features

* **frontend:** add about dialog and version info ([90b33a8](https://github.com/DCsunset/LFReader/commit/90b33a828e212e1998a35031f57dc7213014caf3))
* **frontend:** allow setting api base url and fix error handling ([a439b55](https://github.com/DCsunset/LFReader/commit/a439b5594a3a2cc5f38e2bdeff6a1f137769e0eb))
* **frontend:** init tauri android ([897ddff](https://github.com/DCsunset/LFReader/commit/897ddfffacf9b6ad1fa59cd687cd22853151b811))
* **frontend:** support basic auth for api ([d885129](https://github.com/DCsunset/LFReader/commit/d8851293881c4ca2d11a30857be9dd5603609b0f))
* **frontend:** support PWA ([667e147](https://github.com/DCsunset/LFReader/commit/667e147e534c9d33401167d5a1c7424d5bfb34aa))
* **frontend:** support setting default playback rate ([9ddb095](https://github.com/DCsunset/LFReader/commit/9ddb095cfb8c7ded62559ee11e5a2ea2007c8df0))


### Bug Fixes

* **backend:** add cors middleware to support standalone api server ([fa497db](https://github.com/DCsunset/LFReader/commit/fa497dbbf018dafb440c46fe1facfa93b9c110aa))
* **frontend:** fix api docs url ([171e3b1](https://github.com/DCsunset/LFReader/commit/171e3b140c3c0154a3495db602e680694dce81e9))
* **frontend:** fix overflow in new feeds dialog ([2f2a34a](https://github.com/DCsunset/LFReader/commit/2f2a34a1fcd66a6cba537b39de493fa796b05971))
* **frontend:** improve snackbar ui ([9fabe11](https://github.com/DCsunset/LFReader/commit/9fabe11cfa28e620c5997b371d327bbfd8db05bb))
* **frontend:** open feed url in new tab ([acf43e0](https://github.com/DCsunset/LFReader/commit/acf43e02d6873d831bc6e7e962ccb846c51f39e8))
* **frontend:** reset sate after closing settings dialog ([e0ff7b6](https://github.com/DCsunset/LFReader/commit/e0ff7b6ceea881b6f314ed62d28b001de965a6d3))
* improve error formatting ([54c42cd](https://github.com/DCsunset/LFReader/commit/54c42cd154babdfc74bf93b24aeb5a466e5cc103))


### Misc

* add apk to gitignore ([588a086](https://github.com/DCsunset/LFReader/commit/588a086b16d639c367bb9251d447a7fcf0d6cf6d))
* add scripts to sign apk ([c0393e6](https://github.com/DCsunset/LFReader/commit/c0393e6d9dbd94f2c9541baf6200cec7e35c7fe1))
* add signing instruction for android ([dfab2a5](https://github.com/DCsunset/LFReader/commit/dfab2a59861ab383e6a3b4d65c0107c58a10683b))
* add version bumper for frontend ([f7282c7](https://github.com/DCsunset/LFReader/commit/f7282c72d4fb2a10942df436c53df7756a3260ef))
* add version to package.json and update bumper ([a7f8fe1](https://github.com/DCsunset/LFReader/commit/a7f8fe1ca8194995bc88ef09f129dbd3ac71f66d))
* **frontend:** remove android support due to cors issue ([884ebd1](https://github.com/DCsunset/LFReader/commit/884ebd1e5235b89c8d4fc3435f91270331a43bcb))
* **frontend:** update android icons ([0a1c5d7](https://github.com/DCsunset/LFReader/commit/0a1c5d7a796d36591d6eedb36ca24bdf8c55da1c))
* **frontend:** use stack for settings and refactor layout ([b19fa3b](https://github.com/DCsunset/LFReader/commit/b19fa3b9f600bdaf2c77befd4c1331821b43c8d3))

## [1.3.2](https://github.com/DCsunset/LFReader/compare/v1.3.1...v1.3.2) (2024-04-18)


### Bug Fixes

* **backend:** don't raise exception for parser error ([283cd2b](https://github.com/DCsunset/LFReader/commit/283cd2b1124391c4a4d3b006309871ef34e3e5d0))
* **backend:** log error before raising exception ([7832055](https://github.com/DCsunset/LFReader/commit/7832055544e0fd47eae954d7aff21c3e0eb6e156))
