# LFReader

LFReader is a self-hosted **L**ocal-first **F**eed **Reader** written in Python and Preact/React.

## Features

- Local-first: Feeds and entries are stored in a sqlite3 database so that you can read local feeds even without Internet access. Futhermore, it supports archiving resources like images in the entries.
- Dark mode support: Users can choose between light and dark modes

## Screenshots

![light](docs/screenshots/light.png)

![dark](docs/screenshots/dark.png)

## Installation

### Using docker/podman

```sh
docker run -d -p 8080:80 --name lfreader -v $PWD/data:/app/data dcsunset/lfreader
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
pip install fastapi uvicorn
uvicorn app:app --host 0.0.0.0 --port 3000
```

Finally, use your favorite web server to serve the frontend files (`frontend/dist`)
and set up the reverse proxy to pass routes prefixed by `/api` to backend.
If archiving is enabled (default), make sure the archives directory is served at `/archives`.

## Configuration

### Frontend

Available config options can be found in the sidebar UI.

One important option is to enable/disable archiving.
For feeds that contain many images or videos, it might be slow and expensive to archive them.
You can disable archiving globally in such case.

### Backend

The following environment variables are supported when running the backend:

| Variable         | Default     | Description                                  |
|------------------|-------------|----------------------------------------------|
| LFREADER_DB      | "db.sqlite" | File path to store the database              |
| LFREADER_ARCHIVE | "archives"  | Directory path to store archived resources   |
| USER_AGENT       | None        | User agent to use when sending HTTP requests |


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
uvicorn app:app --reload --port 3000
```


## License

AGPL-3.0

