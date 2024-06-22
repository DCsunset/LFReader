# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.1.4](https://github.com/DCsunset/LFReader/compare/v2.1.3...v2.1.4) (2024-06-22)


### Bug Fixes

* **backend:** fix outdated resource url when archiving db ([e4a7f0f](https://github.com/DCsunset/LFReader/commit/e4a7f0ffa94b84c415b719284a831e59b64b0069))


### Misc

* **frontend:** update dev config ([0d4c3fd](https://github.com/DCsunset/LFReader/commit/0d4c3fd61219a5b030f1d87e3257c467b3f52ad3))

## [2.1.3](https://github.com/DCsunset/LFReader/compare/v2.1.2...v2.1.3) (2024-06-22)


### Bug Fixes

* **backend:** fix entry link when archiving db ([536c42e](https://github.com/DCsunset/LFReader/commit/536c42eb8fbaad766beb9dd8bf3aacc5cabe7f90))

## [2.1.2](https://github.com/DCsunset/LFReader/compare/v2.1.1...v2.1.2) (2024-06-22)


### Bug Fixes

* **backend:** fix resource base url ([31a51e8](https://github.com/DCsunset/LFReader/commit/31a51e8194298981610315dcce6f0e053c50b2cb))

## [2.1.1](https://github.com/DCsunset/LFReader/compare/v2.1.0...v2.1.1) (2024-06-22)


### Bug Fixes

* **backend:** fix archive base url ([f31ade7](https://github.com/DCsunset/LFReader/commit/f31ade7f253d54b351300ce935bc24eac8da0711))

## [2.1.0](https://github.com/DCsunset/LFReader/compare/v2.0.0...v2.1.0) (2024-06-22)


### Features

* **backend:** support archiving feeds in db ([e5a8cb8](https://github.com/DCsunset/LFReader/commit/e5a8cb8cd781548368ee5aba226a24e0d434db97))
* **frontend:** add button to archive db ([a42ca45](https://github.com/DCsunset/LFReader/commit/a42ca4590294ed750222fcbe0b70052fb2cf37c3))
* **frontend:** add loading state in ui ([580430a](https://github.com/DCsunset/LFReader/commit/580430a70c792191c3ad858ba54f0f6a8143b177))
* **frontend:** display author if it exists ([3af1b60](https://github.com/DCsunset/LFReader/commit/3af1b60d297f19b1c527105abc1c5bc4bec71759))


### Bug Fixes

* **frontend:** fix local state when deleting feed ([4770961](https://github.com/DCsunset/LFReader/commit/4770961fcc3b47e573600676f2842521abd85b00))

## [2.0.0](https://github.com/DCsunset/LFReader/compare/v1.4.3...v2.0.0) (2024-06-19)


### ⚠ BREAKING CHANGES

* **backend:** read config from file and support archiving other tags

### Features

* **backend:** append filename to resource hash ([a615745](https://github.com/DCsunset/LFReader/commit/a615745f6b7693b636cc1cb8e888f130a5e07746))
* **backend:** read config from file and support archiving other tags ([8b7380d](https://github.com/DCsunset/LFReader/commit/8b7380d30e3d592c890cdbcb66fcfc866b745bbe))


### Misc

* update gitignore ([0c6f297](https://github.com/DCsunset/LFReader/commit/0c6f297e97157434bc4995a335970756ee54b821))
* update readme and comments ([fd9428f](https://github.com/DCsunset/LFReader/commit/fd9428f8418a6e99ca52cd7ef3e4d279b569ad91))

## [1.4.3](https://github.com/DCsunset/LFReader/compare/v1.4.2...v1.4.3) (2024-05-30)

## [1.4.1](https://github.com/DCsunset/LFReader/compare/v1.4.0...v1.4.1) (2024-04-20)


### Bug Fixes

* **backend:** fix annotated type for openapi ([6e2d887](https://github.com/DCsunset/LFReader/commit/6e2d8875136820d4ad21558b3ee15005fe542ddd))


### Misc

* ignore swagger ui assets ([0fd74e2](https://github.com/DCsunset/LFReader/commit/0fd74e28d5763212b78842785d63be84a1cda0dd))
* update dependency version ([b72d6f7](https://github.com/DCsunset/LFReader/commit/b72d6f7a9d94ac8f79f2e4916192abe262bde1cb))

## [1.4.0](https://github.com/DCsunset/LFReader/compare/v1.3.2...v1.4.0) (2024-04-18)


### Features

* **backend:** support self-hosting swagger ui ([20ba2be](https://github.com/DCsunset/LFReader/commit/20ba2be31425ce795e29c639b75dcc4b8f5622ad))

## [1.3.1](https://github.com/DCsunset/LFReader/compare/v1.3.0...v1.3.1) (2024-04-17)


### Bug Fixes

* **backend:** log error message when failing to parse feed ([34e6665](https://github.com/DCsunset/LFReader/commit/34e6665e1db9c485379d47abdfd2b3fb4476990a))
* **backend:** support retrying when failed to fetch resource ([b2c2dee](https://github.com/DCsunset/LFReader/commit/b2c2dee0cd0453402c3fa63fa92fad63041e0491))
* raise feed parsing error and fix error format ([e4095a9](https://github.com/DCsunset/LFReader/commit/e4095a9de7e854f427fd26a3ea7100f204b57cf9))

## [1.3.0](https://github.com/DCsunset/LFReader/compare/v1.2.0...v1.3.0) (2024-03-15)


### Features

* **frontend:** add more info in feed dialog and fix some icons ([5675553](https://github.com/DCsunset/LFReader/commit/56755533985be70f35bdf853ac177889e672e712))
* support forceArchive option to skip hash check ([6183fe8](https://github.com/DCsunset/LFReader/commit/6183fe828f16e09bb281b21bf37c2b82688591fd))


### Misc

* add migration script and instructions ([548a3c2](https://github.com/DCsunset/LFReader/commit/548a3c26f251d2e2277ef6bbbc8bd5f2d929261c))
* **frontend:** processing entry content only on change ([73adc79](https://github.com/DCsunset/LFReader/commit/73adc793c69d0a81aad80edaae4838bdcca1878e))

## [1.2.0](https://github.com/DCsunset/LFReader/compare/v1.1.0...v1.2.0) (2024-03-15)


### ⚠ BREAKING CHANGES

* **backend:** add new data to db and use hash to skip processed content

### Features

* **backend:** add new data to db and use hash to skip processed content ([c3d4726](https://github.com/DCsunset/LFReader/commit/c3d472642291adc2ff99bba0d1b22d7d3fed448f))


### Misc

* add installation instruction for Nix ([e5afa63](https://github.com/DCsunset/LFReader/commit/e5afa63aff85ff2a351b9c2c13bb752514def58f))

## [1.1.0](https://github.com/DCsunset/LFReader/compare/v1.0.4...v1.1.0) (2024-03-14)


### Features

* **backend:** add timeout and log level config ([353fe0e](https://github.com/DCsunset/LFReader/commit/353fe0e1e75707ef01fdde4f051553a914c22d4e))

## [1.0.4](https://github.com/DCsunset/LFReader/compare/v1.0.3...v1.0.4) (2024-03-12)


### Bug Fixes

* **backend:** fix backend dependencies ([af57c88](https://github.com/DCsunset/LFReader/commit/af57c882847a22cf413ba4949b1d75eb03893aa5))

## [1.0.3](https://github.com/DCsunset/LFReader/compare/v1.0.2...v1.0.3) (2024-03-12)


### Bug Fixes

* **backend:** auto create parent dir for sqlite db ([48f0d86](https://github.com/DCsunset/LFReader/commit/48f0d86323f01b848ee397c43ce03186640b5748))

## [1.0.2](https://github.com/DCsunset/LFReader/compare/v1.0.1...v1.0.2) (2024-03-12)


### Misc

* add badges in readme ([942736d](https://github.com/DCsunset/LFReader/commit/942736d48e9060e9a667674d14d7e79e1ba49624))
* add more instructions for installation and development ([b28cc30](https://github.com/DCsunset/LFReader/commit/b28cc30da3e7f9c4191bfce88180ddcaf59d23d2))
* add pyproject config and entry point ([0312872](https://github.com/DCsunset/LFReader/commit/03128721353c86f3a13b6b686ebfe7926cec36fc))
* add step to update repo description ([61bb9c2](https://github.com/DCsunset/LFReader/commit/61bb9c2e0fcbf378218622e9d254f46bf663de62))
* **backend:** move files to lfreader_server module ([3df0cbb](https://github.com/DCsunset/LFReader/commit/3df0cbb152b7922d73354bb19b6ba400a078612f))
* update docker start script ([134887c](https://github.com/DCsunset/LFReader/commit/134887c67e163ee9ee078619f4c053548d00ac27))

## [1.0.1](https://github.com/DCsunset/LFReader/compare/v1.0.0...v1.0.1) (2024-03-11)


### Misc

* use venv for docker build ([a24b43a](https://github.com/DCsunset/LFReader/commit/a24b43a2749a66b14188d4a4fa577b69c9f37856))

## 1.0.0 (2024-03-11)


### ⚠ BREAKING CHANGES

* **backend:** store resources in feed-specific dir and support deletion
* **frontend:** refactor using preact
* **frontend:** update actions based on backend api
* **backend:** optimize backend api and remove url encoding
* **backend:** use FastAPI in place of Flask

### Features

* add delete api and fix some bugs and return types ([e502921](https://github.com/DCsunset/LFReader/commit/e50292181e41c65685519eda58653ce5bb6e6f8b))
* add option to disable archiving ([2bdddcf](https://github.com/DCsunset/LFReader/commit/2bdddcf3124f7a4223ae12af1bb6eb8ce5bc4820))
* add scroll-to-top button for entry ([7748e8e](https://github.com/DCsunset/LFReader/commit/7748e8e56320c2877571bed9978215c8b727ae11))
* **backend:** add archiver to download resources ([c9822d5](https://github.com/DCsunset/LFReader/commit/c9822d5982b1c7207882810e5614c71f2f038699))
* **backend:** add basic backend code ([ccd7592](https://github.com/DCsunset/LFReader/commit/ccd75924c881d84197e20720d3fb2161d8b1aca4))
* **backend:** add feed query args ([f524364](https://github.com/DCsunset/LFReader/commit/f5243640726ddc25dcf8c9976f1e63e96596206c))
* **backend:** add option to disable OpenAPI and docs ([ce47c27](https://github.com/DCsunset/LFReader/commit/ce47c27d6abd37a4f29dbb21ca4b3856fe44c3a1))
* **backend:** add tags to returned feeds ([d6e98ab](https://github.com/DCsunset/LFReader/commit/d6e98ab5cfcf0f2eaa3a9c2ac6a77fd1bbfd2287))
* **backend:** add update_feed api and fix some bugs ([25a47a4](https://github.com/DCsunset/LFReader/commit/25a47a4d1bdbe96600b0c8c15f1a7e939d6a3730))
* **backend:** improve error handling ([6aac406](https://github.com/DCsunset/LFReader/commit/6aac40615bb262bccd6c7ca49dc51f2ff2ae31ad))
* **backend:** set logging level and add db path config ([1263a8f](https://github.com/DCsunset/LFReader/commit/1263a8fcd71917d3a3db8dc00264c219d889b76f))
* **backend:** sort entries by updated_at and support offset and limit ([11a8e05](https://github.com/DCsunset/LFReader/commit/11a8e0544383aff1a0f3e449e8b3ab6f29062982))
* **backend:** store resources in feed-specific dir and support deletion ([22ab005](https://github.com/DCsunset/LFReader/commit/22ab0050e49a0c9286e8347ae1e67484babaaa46))
* **backend:** store summary details and support updating all feeds ([b4e2e0e](https://github.com/DCsunset/LFReader/commit/b4e2e0ee6765c3ec0275516f9a7b5faa2e3699c0))
* **backend:** support setting base_url in user_data ([8a22614](https://github.com/DCsunset/LFReader/commit/8a2261434ff8858ea61e1255cb340d72a2e05893))
* **backend:** support tags for feed ([55fcef3](https://github.com/DCsunset/LFReader/commit/55fcef3a7984bdeefb1d163954407bf4378e7eef))
* **backend:** use FastAPI in place of Flask ([6f78673](https://github.com/DCsunset/LFReader/commit/6f7867319d2b6263e552f88b90a2758b2cd6fce6))
* display published date and improve styles ([179f000](https://github.com/DCsunset/LFReader/commit/179f0000eba4d303b98842fa9059ee9142529269))
* **frontend:** add actions to fetch data ([d3f7f69](https://github.com/DCsunset/LFReader/commit/d3f7f6985e1c4802efafa538c0e698bdcc3deb57))
* **frontend:** add basic layout and notification ([e3ef275](https://github.com/DCsunset/LFReader/commit/e3ef27585a7eca96a307b562b522b2e8ded857f2))
* **frontend:** add clickable links for feed and entry in app bar ([324e29d](https://github.com/DCsunset/LFReader/commit/324e29dabbba7b9c0bbeb55dae8cdad005c41bfc))
* **frontend:** add code highlighting ([833b25f](https://github.com/DCsunset/LFReader/commit/833b25f3e94ca72e7d1e3d277f2a21d09761261d))
* **frontend:** add drawer layout ([ed16225](https://github.com/DCsunset/LFReader/commit/ed1622541462218bbf311b4ec64e3f9df26effb7))
* **frontend:** add entry content page ([961399e](https://github.com/DCsunset/LFReader/commit/961399ed420be57a893012b09a94afb6462c408c))
* **frontend:** add entry date and feed title ([19c79b8](https://github.com/DCsunset/LFReader/commit/19c79b8c18893f1b425ae98f2e95aec085e6aed7))
* **frontend:** add entry list ([f5a9344](https://github.com/DCsunset/LFReader/commit/f5a93445ed156d0dada867ec148029d434cd4cbf))
* **frontend:** add feed list of different tags ([87351d9](https://github.com/DCsunset/LFReader/commit/87351d9217b37662e5e57e8adbe10ac17a890511))
* **frontend:** add feed query params ([f15c79f](https://github.com/DCsunset/LFReader/commit/f15c79f038c439b92a1e6203b5674b00fd472cd4))
* **frontend:** add feed title to entry page ([2e15dd4](https://github.com/DCsunset/LFReader/commit/2e15dd4629a7853b4d77eda8a55036f16237dbd6))
* **frontend:** add FeedList and proxy for dev server ([8a006e1](https://github.com/DCsunset/LFReader/commit/8a006e182bee5f18fea7c544077d5194081df8a1))
* **frontend:** add FeedsDialog to add new feeds ([13c4beb](https://github.com/DCsunset/LFReader/commit/13c4beba0f16ee82b1a03299d93c8aa9f4cc255c))
* **frontend:** add frontend framework ([d74a5e6](https://github.com/DCsunset/LFReader/commit/d74a5e618a7a501bc00299e5f777ee8bab5a15a0))
* **frontend:** add grid layout and entry components ([3552763](https://github.com/DCsunset/LFReader/commit/35527637682bb7810b00517726147a222c94ee5c))
* **frontend:** add highlight.js to highlight code ([8959bd8](https://github.com/DCsunset/LFReader/commit/8959bd8cb9d755a199d3cd76e040a74d77b8581e))
* **frontend:** add icon ([be0f4f6](https://github.com/DCsunset/LFReader/commit/be0f4f6ab6ac29d285a27645536feeea31fb1f62))
* **frontend:** add loading component to center the progress bar ([6817607](https://github.com/DCsunset/LFReader/commit/6817607f45e30a7d955928aff079a2b304ab920d))
* **frontend:** add more info for entry and improve UI ([1c5f588](https://github.com/DCsunset/LFReader/commit/1c5f588cd9c039dd48910bfd89c2c9530f6188bc))
* **frontend:** add mui framework and fonts ([879bc08](https://github.com/DCsunset/LFReader/commit/879bc08b0a2cedf5a893340317acf04a0428eb9c))
* **frontend:** add pagination ([1a3c67e](https://github.com/DCsunset/LFReader/commit/1a3c67e7dfb4db01d0af63d531a23553c70dbe40))
* **frontend:** add proxy and change url for api ([b0a605e](https://github.com/DCsunset/LFReader/commit/b0a605e0d37e6f1490fe5b99dd336adddfeeacc1))
* **frontend:** add react router ([61f5842](https://github.com/DCsunset/LFReader/commit/61f5842e108ee2f231ab51fc27a8967654e03fd4))
* **frontend:** add responsive drawer ([b48ef22](https://github.com/DCsunset/LFReader/commit/b48ef22aa81cf44327355b3bb746ad69ea599d55))
* **frontend:** add scroll bar to entry list and fix layout height ([2d8389b](https://github.com/DCsunset/LFReader/commit/2d8389b6f1d6ed8d1c77db627ce65c1b98955e01))
* **frontend:** add tag `All` and num of feeds in each tag ([5baa0ff](https://github.com/DCsunset/LFReader/commit/5baa0ff38f4b70abf0a1044603ea5b49f0f58619))
* **frontend:** add title state ([35bc351](https://github.com/DCsunset/LFReader/commit/35bc3518efcd661d7a379c391c2b30acd62255d2))
* **frontend:** add type definition for feeds ([89f1e86](https://github.com/DCsunset/LFReader/commit/89f1e86ebf33ad8cbfea045a23d138f78fb3d351))
* **frontend:** add update button ([68238f2](https://github.com/DCsunset/LFReader/commit/68238f22680d0231024adeecbdda42b5ef3eb688))
* **frontend:** adjust qoute and code style ([49ffcfe](https://github.com/DCsunset/LFReader/commit/49ffcfe11a05df1aca0a2663a694833878fec512))
* **frontend:** adjust styles of entry content ([1ce4258](https://github.com/DCsunset/LFReader/commit/1ce4258aa907bd85230eb15222a52f1c390e62e9))
* **frontend:** display entry content ([4152dd5](https://github.com/DCsunset/LFReader/commit/4152dd52f88862404e1c9a256235aeff74bb8232))
* **frontend:** fetch entries in EntryListLayout and add entry to route ([10e4252](https://github.com/DCsunset/LFReader/commit/10e42526d7d30a197112ecf33cefe251c5fff46f))
* **frontend:** fix queryParams and improve UI ([cb56756](https://github.com/DCsunset/LFReader/commit/cb56756dd4ba6c91c3b68ac7191aed72c63dc2de))
* **frontend:** hide list for tag All ([a4ce414](https://github.com/DCsunset/LFReader/commit/a4ce4148fa58ca6a98f08f07b30951bb1a45984d))
* **frontend:** improve responsive layout and allow toggling entry list ([432633e](https://github.com/DCsunset/LFReader/commit/432633eda8e07999c4b29d11cdc7102a22e35fc9))
* **frontend:** improve UI for feed list ([810ce78](https://github.com/DCsunset/LFReader/commit/810ce7816f0af2166f23a0e312b24c8ccf48ebf4))
* **frontend:** refactor api and state and add update action ([81e5d7f](https://github.com/DCsunset/LFReader/commit/81e5d7fb63402b4911c7fb00b3969fd5bef0d892))
* **frontend:** show list of feeds with icons ([3f1c547](https://github.com/DCsunset/LFReader/commit/3f1c5478c538a698c4e1a659af46229b9acdb5ae))
* **frontend:** support deleting feeds ([baff0d8](https://github.com/DCsunset/LFReader/commit/baff0d8159d2dd00acf65d79495c617814f39327))
* **frontend:** support editing feed's user_data and fix some bugs ([1bb44b4](https://github.com/DCsunset/LFReader/commit/1bb44b49f3efea0c68522c468746b6fa953130f3))
* **frontend:** support fetching icon from url ([b6cbf57](https://github.com/DCsunset/LFReader/commit/b6cbf5749d465b0e174bf572df2b12eddf74d5f9))
* **frontend:** support math formula and optimize rendering ([1ff9f6a](https://github.com/DCsunset/LFReader/commit/1ff9f6a124e0566f0f71d6c9a278fb2d14df36c9))
* **frontend:** support setting alias for feeds ([586d29f](https://github.com/DCsunset/LFReader/commit/586d29fda8cca39e8a623547815e1f7c5db8045e))
* **frontend:** update logo ([08efbc8](https://github.com/DCsunset/LFReader/commit/08efbc88b197fd087a0e5dde579f8202205af06d))
* **frontend:** use Recoil for state management ([b1ca8ca](https://github.com/DCsunset/LFReader/commit/b1ca8caaf35af873f118a4f0fb4585d78af61401))
* **frontend:** use swr to fetch data ([3b7da18](https://github.com/DCsunset/LFReader/commit/3b7da18d240d277b8232cb0f6dd0ac4fb93ec3b9))
* use flake to manage dependencies ([e7a531c](https://github.com/DCsunset/LFReader/commit/e7a531cbe95047339aca8588d45f42aa1e98bbd9))


### Bug Fixes

* **backend:** add handler for decoding error ([a857f85](https://github.com/DCsunset/LFReader/commit/a857f85589609f5d8bc5baf72543f50956b28d7e))
* **backend:** change default config ([4abd995](https://github.com/DCsunset/LFReader/commit/4abd995885643e83b57057df53dc8baad965ec81))
* **backend:** exclude unnecessary fields in response ([45152c4](https://github.com/DCsunset/LFReader/commit/45152c4ca60fea95c2aff61744293371af15c04c))
* **backend:** fix data processing and encoding ([c6a5ab2](https://github.com/DCsunset/LFReader/commit/c6a5ab2ac6f048dca1cfb51806f8b25cce100f51))
* **backend:** fix date parsing ([3886f15](https://github.com/DCsunset/LFReader/commit/3886f15a923e037143965997d9b0c70feaeb4d55))
* **backend:** fix delete api ([eaf724e](https://github.com/DCsunset/LFReader/commit/eaf724e5637fd265cf53c574ae961a010373d01f))
* **backend:** fix getEntries sql query ([233657c](https://github.com/DCsunset/LFReader/commit/233657caa3789956c6a0c063fed3a5bc14e92148))
* **backend:** fix query params ([12f2aa8](https://github.com/DCsunset/LFReader/commit/12f2aa8c6334b94f13a9c8502274ea26363363ed))
* **backend:** fix some bugs ([38f736a](https://github.com/DCsunset/LFReader/commit/38f736a15bad105a295067c583032c923624afda))
* **backend:** fix update api ([70e6167](https://github.com/DCsunset/LFReader/commit/70e6167be0a073c73167f9758e17a9e2f7304a18))
* **backend:** makes feed args optional ([7bcd1a5](https://github.com/DCsunset/LFReader/commit/7bcd1a5268b8aafc1839fcc80ec8a48d2af9cb44))
* **backend:** remove archive dir only if it exists ([049dea8](https://github.com/DCsunset/LFReader/commit/049dea806cdd452df751b43581c73c9fdf857ed0))
* **backend:** sort entries by published_at ([a47c7c5](https://github.com/DCsunset/LFReader/commit/a47c7c59f519458ba1029797f77f9be05579a117))
* **backend:** support multi-threading ([e2bab51](https://github.com/DCsunset/LFReader/commit/e2bab51c30ee061db9336e433d1875e3ee43a068))
* **backend:** update encoder to include feed_url ([7e36d18](https://github.com/DCsunset/LFReader/commit/7e36d18084ef1643da1dbe0a9c0162c3f0e3469d))
* **backend:** use url-safe id decoding ([d049f21](https://github.com/DCsunset/LFReader/commit/d049f21ad5c4e38d3a73f2dfe3247a277cb13aba))
* **docker:** update env variables ([cb82056](https://github.com/DCsunset/LFReader/commit/cb820568f4f440191b26671470ed10bcff709cad))
* fix api and improve ui styles ([a37def1](https://github.com/DCsunset/LFReader/commit/a37def102eebb9f494ae6bb0b56446e2481aab31))
* fix docker build and other bugs ([305489a](https://github.com/DCsunset/LFReader/commit/305489a2a839641573de4898d81f9753a8378c65))
* **frontend:** adjust styles of loading and divider ([2b8df1e](https://github.com/DCsunset/LFReader/commit/2b8df1ec258e451e0975ed816598b8bf5c628085))
* **frontend:** encode feed id ([a85520e](https://github.com/DCsunset/LFReader/commit/a85520e7eb2846b991d42dd1e76ff3ca596c333d))
* **frontend:** fix a typo ([240d0da](https://github.com/DCsunset/LFReader/commit/240d0da2d6450df3bcbb9343353a895ab16ee70d))
* **frontend:** fix code rendering and styles ([5d5485a](https://github.com/DCsunset/LFReader/commit/5d5485a5e7b649c70abe78194d49840f2b88f537))
* **frontend:** fix default drawer state and drawer mounting ([fb7d232](https://github.com/DCsunset/LFReader/commit/fb7d232c792ed02dc10f10584c3e9fc6bfbf96c1))
* **frontend:** fix delete and update api ([b1a5eb1](https://github.com/DCsunset/LFReader/commit/b1a5eb177ad6b7e60e06bab8ec5ed8ee950bc0fd))
* **frontend:** fix entry content ([bbdb749](https://github.com/DCsunset/LFReader/commit/bbdb74967addc6e0d728ac1be6fcde454e0a7248))
* **frontend:** fix feed types and add tag operations ([e3db761](https://github.com/DCsunset/LFReader/commit/e3db761b8dd867e82fcd4bff42f7537b43d96f30))
* **frontend:** fix frontend styles ([7c594ba](https://github.com/DCsunset/LFReader/commit/7c594bae7cdcee5c8ae611fd87e77e81ba7febc5))
* **frontend:** fix layout and add queryParams to state ([d08594d](https://github.com/DCsunset/LFReader/commit/d08594d51eac22da91cb9b2a02ad4fd89648a09b))
* **frontend:** fix route params and use recoil for feeds ([2ace109](https://github.com/DCsunset/LFReader/commit/2ace109158d284fffc742276ba68e37436f6f7d8))
* **frontend:** fix some bugs and add anchor for feed title ([f609626](https://github.com/DCsunset/LFReader/commit/f60962636243d3fd6d9667287c30024759e3867a))
* **frontend:** fix ui styles and display issues ([114dda7](https://github.com/DCsunset/LFReader/commit/114dda7c68370b1e66d1fedea1b45f32555fd328))
* **frontend:** fix video overflow ([7f84cb0](https://github.com/DCsunset/LFReader/commit/7f84cb042e09ce7c90e0ddec4c867db61fdb4c09))
* **frontend:** open links in entry in external page ([59c8f11](https://github.com/DCsunset/LFReader/commit/59c8f11f2e09758500c234fefe5eb30de49ee509))
* **frontend:** optimize link and img tag ([499bb75](https://github.com/DCsunset/LFReader/commit/499bb7592bdc24c000d3d6dae72ad6ba9c5f088c))
* **frontend:** suppress hljs warning ([b1aa751](https://github.com/DCsunset/LFReader/commit/b1aa7512211fa994ed8473b56638d4dd94b9cc60))
* **frontend:** use Base64 to encode feedUrl in routes ([6055fdb](https://github.com/DCsunset/LFReader/commit/6055fdb097187c7da06576edb0ebb690f87d6cc1))
* refactor api and fix table structure and update ([b3eb894](https://github.com/DCsunset/LFReader/commit/b3eb8947b537fb20b6471ed939e1788731e7648f))


### Misc

* add container build ([259b0be](https://github.com/DCsunset/LFReader/commit/259b0bebe6bcfe85b0573110b58a5c8ea30d5e26))
* add docker image build ([07af582](https://github.com/DCsunset/LFReader/commit/07af582ca4ebd323645ceaf573e0ecbb96b22148))
* add Dockerfile ([2a9e104](https://github.com/DCsunset/LFReader/commit/2a9e10421977ac7ecd096f7afb7e71b212728ee5))
* add versionrc ([dac6c6a](https://github.com/DCsunset/LFReader/commit/dac6c6a7e479892c51f4ed87de134072f9ea67b2))
* **backend:** add db file to gitignore ([e3aaa5d](https://github.com/DCsunset/LFReader/commit/e3aaa5d37842b4ec8cba04caece314cd4a6766c1))
* **backend:** add docs for db path ([6772a5e](https://github.com/DCsunset/LFReader/commit/6772a5ecb6c2db97f07b50c214b742e89cd5b175))
* **backend:** add get_all api and refactor update api ([80a5bab](https://github.com/DCsunset/LFReader/commit/80a5babe39c562e6ff85eab6976160d830f70961))
* **backend:** add sqlite3 temp files to gitignore ([e8761a2](https://github.com/DCsunset/LFReader/commit/e8761a2d6470522ed501ec9811adbd197c2b8269))
* **backend:** add usage ([f192230](https://github.com/DCsunset/LFReader/commit/f1922303f6dffc0aef90f81f4249581e7a6267c5))
* **backend:** fix a typo in code ([6c8814e](https://github.com/DCsunset/LFReader/commit/6c8814e247c772752ffd1b792e59b36be168b043))
* **backend:** improve error handling ([0e37695](https://github.com/DCsunset/LFReader/commit/0e376957e304339a418da70b38672d6c06b75ba5))
* **backend:** optimize backend api and remove url encoding ([b3f2630](https://github.com/DCsunset/LFReader/commit/b3f2630777b17d33764a92bfb67cebb84ff71f32))
* **backend:** update README ([28ad4f1](https://github.com/DCsunset/LFReader/commit/28ad4f17d144034544e2904cd25669f727d2487f))
* **backend:** use fastapi's json encoder ([38602de](https://github.com/DCsunset/LFReader/commit/38602de86abf3e37f0c07c4976de969bf145af0a))
* extract entry to a separate component ([2be6ff0](https://github.com/DCsunset/LFReader/commit/2be6ff0c171b8ae9d9754fee95f8ac172308e4e3))
* **frontend:** bump dependency versions ([061275e](https://github.com/DCsunset/LFReader/commit/061275e3650971a5f218b7adc45fa826001101e4))
* **frontend:** optimize feed lookup ([dfceada](https://github.com/DCsunset/LFReader/commit/dfceada30c36045ef2cf21692e3671d88687de7f))
* **frontend:** refactor using preact ([ec9ce2d](https://github.com/DCsunset/LFReader/commit/ec9ce2ddc4e1a1725defe9f76ef3167e10e75d2a))
* **frontend:** remove default styles and logo ([601918d](https://github.com/DCsunset/LFReader/commit/601918d227dc9a5e3ecfd97cdb02c665775465a2))
* **frontend:** update actions based on backend api ([0f837f1](https://github.com/DCsunset/LFReader/commit/0f837f117321216411254ea05150c4b65e186ddd))
* **frontend:** update dependencies ([ee7b2db](https://github.com/DCsunset/LFReader/commit/ee7b2db56b64a9ad6d732695bfd9b57496b86a00))
* rename app to lfreader and add README ([0cd2d17](https://github.com/DCsunset/LFReader/commit/0cd2d17b18a6ff3af75da28c006e4a2fea6bc89c))
* update copyright notice ([97e0b8d](https://github.com/DCsunset/LFReader/commit/97e0b8d9e9ef00e1aa8bc35fcc2cf03e0ad73df6))
* update flake command ([e29b79e](https://github.com/DCsunset/LFReader/commit/e29b79ef45d41a346b9d976f5efca816c1c35734))
* update github action ([f23a50e](https://github.com/DCsunset/LFReader/commit/f23a50e51c8ba40e428372238df9c65875b0d828))
* update readme and add screenshots ([9ea96b5](https://github.com/DCsunset/LFReader/commit/9ea96b51a0dd6d57deae5a6585623c02ef8a4bea))
