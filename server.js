const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const handlers = require('./handlers/handlers');

const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));

app.post('/data', async (req, res) => handlers.addNewAsset(req,res));

app.get('/getPubKey', (req, res) => handlers.getServerPublicKey(req, res));

app.listen(3000);