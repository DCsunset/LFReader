# yafr backend

## Usage

First, install all the dependencies (you could also use `venv` here):

```sh
pip install -r requirements.txt
```

For development, start the app using `uvicorn`:

```sh
uvicorn app:app --reload --port 3000
```

For production, remove the `--reload` option:

```sh
uvicorn app:app --host 0.0.0.0 --port 3000
```

To change the database path (default to `./db.sqlite`),
set the environment variable `YAFR_DB`:

```sh
export YAFR_DB=$HOME/db.sqlite
uvicorn app:app --host 0.0.0.0 --port 3000
```

