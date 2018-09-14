const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const handlers = require('./handlers/handlers');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));

app.post('/data', async (req, res) => handlers.addNewAsset(req,res));

app.get('/getPubKey', (req, res) => handlers.getServerPublicKey(req, res));

app.get('/getAssets/:assetID', (req, res) => handlers.getAssets(req, res));

app.get('/getFile/:hash', (req, res) => handlers.getFile(req, res));

app.get('/proof/:assetID/:txNumber/:hash/:timestamp', (req, res) => handlers.getProof(req, res));

const httpsOptions = {
    key: fs.readFileSync(process.env.KEY),
    cert: fs.readFileSync(process.env.CERT)
};

const server = https.createServer(httpsOptions, app).listen(3000, () => {
    console.log('server running at ' + 3000)
})
