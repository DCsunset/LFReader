# yafr backend

## Usage

First, install all the dependencies (you could also use `venv` here):

```sh
pip install -r requirements.txt
```

For development, start the app using flask:

```sh
flask run --host 127.0.0.1 --port 3000
```

For production, install `waitress` and run:

```sh
waitress-serve --host 127.0.0.1 --port 3000 app:app
```
