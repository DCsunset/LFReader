# LFReader

LFReader is a self-hosted Local-first Feed Reader written in Python and React.

## Features

- Local-first: Feeds and entries are stored in a sqlite3 database so that you can read local feeds even without Internet access.


## Installation

### Using docker/podman

```sh
docker run -d -p 8080:80 --name lfreader -v $PWD/data:/app/data dcsunset/lfreader
```

### From source code

First, clone this repo.

Then, build the frontend (built files are in directory `frontend/dist`):

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
pip install fastapi uvicorn
uvicorn app:app --host 0.0.0.0 --port 3000
```

Finally, use your favorite web server to serve the frontend files (`frontend/dist`)
and set up the reverse proxy to pass routes prefixed by `/api` to backend.


## Development

### Backend

With Nix, ;un dev server directly: `nix run .#backend-dev`

Or install all the dependencies (you could also use `venv` here):

```sh
pip install -r fastapi uvicorn
uvicorn app:app --reload --port 3000
```

To change the database path (default to `./db.sqlite`),
set the environment variable `LFREADER_DB`:

```sh
export LFREADER_DB=$HOME/db.sqlite
nix run .#backend-dev
```




## License

AGPL-3.0

