## About
This is on open source project which aims to make easy solution with timestamping data on blockchain

## What this server do?

# Add new asset

This method allows us to send new asset to GO server which will generate new merkle tree and push root hash into Blockchain.

* **URL**  
```/data```
* **Method**  
  `POST`
*  **Body Params** 
```
type: Object

{
  name {String} - assetID 

  hash {String} - file hash 

  data {String} - file data in Base64 format encrypted by RSA 

  clientPubKey {String} - RSA public key from client

  signature {String} - RSA signature of file data
}
```
* **Headers**
```
host - client ip address
```

# Get server public key of RSA encryption

This method allows to get server RSA public key to secure data transfer and send it to client.

* **URL**  
```/getPubKey```
* **Method**  
  `GET`
* **Response**  
`String` - server RSA public key 

# Get asset via assetID

This method allows to get asset from GO server and send it to client.

* **URL**  
```/getAssets/:assetID```
* **Method**  
  `GET`
*  **URL Params** 
```
assetID - name of asset 
```
* **Response**   
```
type: Array

[{
  hash - file hash
  name - file name
  txNumber - number of transaction in this assetID
}]
```

# Get file from database

This method allows to get asset from database and send it to client.

* **URL**   
```/getFile/:hash```
* **Method**   
  `GET`
*  **URL Params**  
```
hash - file hash
```
* **Response**  
```
type: String

file in Base64 format
```

# Get asset merkle proof

This method allows to get merkle proof from GO server and sent it to client.

* **URL**  
```/proof/:assetID/:txNumber/:hash/:timestamp```
* **Method**  
  `GET`
*  **URL Params** 
```
assetID - asset name

txNumber - number of transaction in this assetID

hash - file hash

timestamp - time in unix format when the file was created
```
* **Response**
```
type: Array
```




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
Before you build a project - you need to add environment variables to .env
```

git clone "https://github.com/BANKEX/poa-history.git"

git checkout production_server

sudo docker build -t prod_server .

sudo docker run --rm -it -p 3000:3000 prod_server

```
