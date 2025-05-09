# LFReader

[![Docker Image Version](https://img.shields.io/docker/v/dcsunset/lfreader?label=docker)](https://hub.docker.com/r/dcsunset/lfreader)
[![GitHub License](https://img.shields.io/github/license/DCsunset/LFReader)](https://github.com/DCsunset/LFReader)

LFReader is a self-hosted **L**ocal-first **F**eed **Reader** written in Python and Preact/React.

> [!NOTE]
> This app is still in its early stage. Breaking changes may occur from time to time.
> Check migration notes before updating.

## Features

- PWA (Progressive Web App) support: provide better loading experience and can be installed to a device
- Support for various feed formats: RSS, Atom, CDF, and JSON feeds
- Local-first: Feeds and entries are stored in a sqlite3 database so that you can read local feeds even without Internet access. Futhermore, it supports archiving resources like images in the entries.
- Dark mode support: Users can choose between light and dark modes
- Flexible archiving options: User can use regex to filter the html tags and values when archiving
- Responsive UI: it supports both large-screen and small-screen devices

## Screenshots

Light mode:

![light](docs/screenshots/light.png)

Dark mode:

![dark](docs/screenshots/dark.png)

Config options:

![config](docs/screenshots/config.png)


## Usage

### Using docker/podman

```sh
# create data dir
mkdir -p data
docker run -d -p 8080:80 --name lfreader -v $PWD/data:/app/data dcsunset/lfreader
```

Then access `http://localhost:8080` in browser.

The database and archived files will be stored in the volume `/app/data` in container (or where you mount it in the host).
The log of backend server is stored at `/app/logs/backend.log` inside the container.
You can quickly check the log by `docker exec lfreader tail /app/logs/backend.log`.

The default config file can be found in `docker/config.json` in this repo.
You can use your own config simply by mounting it to `/app/config.json`:
```sh
# suppose your config is at ./config.json
docker run -d -p 8080:80 --name lfreader -v $PWD/config.json:/app/config.json -v $PWD/data:/app/data dcsunset/lfreader
```


### Using pip

To install backend server only, you can use pip to install the backend dir in this repo:

```sh
pip install -e "git+https://github.com/DCsunset/LFReader.git#egg=lfreader_server&subdirectory=backend"
```

### Using Nix

This package is available in [NUR](https://nur.nix-community.org/repos/dcsunset/).
The output of the derivation includes both backend executable (`bin/lfreader-server`)
and frontend static files (in `share/lfreader`).

Besides, a NixOS module for backend server is provided in the [Nix flake](https://github.com/DCsunset/nur-packages) output.
Simply import the flake and import the module `modules.lfreader` and add the following NixOS configuration:
```nix
{
  imports = [ nur-dcsunset.modules.lfreader ];
  services.lfreader = {
    enable = true;
    host = "::";
    port = 3000;
    openFirewall = true;
    settings = {
      db_file = "/data/db.sqlite";
      archiver = {
        base_dir = "/data/archives";
      };
      log_level = "info";
    };
  };
}
```


### From source code

First, clone this repo.

Then, build the frontend (bundled files are in directory `frontend/dist`):

```sh
cd frontend
npm i
npm run build
cd ..
```

Next, install dependencies and run backend:

```sh
# use Nix
nix run .#backend-prod

# or manually
cd backend
pip install -r requirements.txt
uvicorn lfreader_server.app:app --host 0.0.0.0 --port 3000
```

Finally, use your favorite web server to serve the frontend files (`frontend/dist`)
and set up the reverse proxy to pass routes prefixed by `/api` to backend.
If archiving is enabled (default), make sure the archives directory is served at `/archives`.


### Others

This repo also provide a backend CLI tool `lfreader_lookup` to look up an archived resource file in a database.



## Configuration

### Frontend

Available config options can be found in the sidebar UI.

One important option is to enable/disable archiving.
For feeds that contain many images or videos, it might be slow and expensive to archive them.
You can disable archiving globally in such case.

### Backend

The following environment variables are supported when running the backend:

| Variable        | Description      |
|-----------------|------------------|
| LFREADER_CONFIG | Config file path |


The config file is in JSON format.
Please see refer to `Config` class in file `backend/config.py` for available options and default values.


## Development

### Frontend

Change directory to `frontend`.
Create a symlink `public/archives`to the backend archive directory to serve resources.
Finally, run `npm run dev`.

### Backend

With Nix, run dev server directly: `nix run .#backend-dev`

Or install all the dependencies (you could also use `venv` here):

```sh
pip install -r fastapi uvicorn
uvicorn lfreader_server.app:app --reload --port 3000
```

To test if the backend pyproject can build successfully:

```sh
cd backend
## optionally set up vevn
# python -m venv venv
# . ./venv/bin/activate

## pip install
pip install .
```


## Migration

### v3.0.0

Steps to migrate database from v2.0.0+ to v3.0.0+:
1. Make a backup of both the old database and archive directory
2. Change `base_url`, `base_dir`, and `archive_options` to match your old settings and put the old archive directory at the specified location
3. Run `python scripts/migrate_v3.0.0.py <old_db> <new_db>` to create the new db and update the archive directory
4. Remove unnecessary subdirectories n archive directory. The new archives directory should only contain files
5. Test the migrated db and archive directory with v3.0.0+
6. It's recommended to use the db with v3.1.0+ as it optimizes the storage


### v2.0.0

Move original environment variables to config file.

### v1.2.0

Steps to migrate database from below v1.2.0 to v1.2.0:
1. Make a backup of the old db first.
2. Create a new database by running LFReader server v1.2.0.
3. Add all previous feeds through API or Web UI
4. Run `python scripts/migrate_v1.2.0.py <old_db> <new_db>` to migrate all previous entries

## License

AGPL-3.0

