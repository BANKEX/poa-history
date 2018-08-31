## About
This is on open source project which aims to make easy solution with timestamping data on blockchain

## About ENV 

```

LOGIN: Login of Mongo

PASSWORD: Password of Mongo

URL: IP/URL of Mongo

DB: Selected Mongo Database

AUTH: Auth access token to golang server

GO_SERVER: URL of golang server

```
## Deploying

```

npm i

AUTH="" GO_SERVER="" URL="" LOGIN="" PASSWORD="" DB="" node server.js

```

## Docker
Перед тем, как билдить проект - необходимо добавить в .env переменные окружения
```

git clone "https://github.com/BANKEX/poa-history.git"

git checkout production_server

sudo docker build -t prod_server .

sudo docker run --rm -it -p 3000:3000 prod_server

```
