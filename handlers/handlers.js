const toBuffer = require('typedarray-to-buffer');
const crypto = require('./../crypto/crypto');
const request = require('./../requests/request');
const db = require('./../database/database');

const key = {};

async function addNewAsset(req, res) {
    const reqData = req.body;

    const host = req.headers.host;

    const assetID = reqData.assetID;
    const hash = reqData.hash;
    const encryptedData = reqData.data;
    const clientPubKey = crypto.toNodeRSAPubKey(reqData.clientPubKey);
    const signature = toBuffer(reqData.signature);
    const data = crypto.decrypt(key[host], encryptedData);
    const verify = crypto.verify(data, signature, clientPubKey);

    if (!verify) {
        res.statusCode = 401;
        res.end('Verify is invalid');
        return;
    }

    const response = await request.addAsset(assetID, hash);
    db.file.add(hash, toBuffer(data));
    res.statusCode = 200;
    res.send(response);
}

function getServerPublicKey(req, res) {
    const host = req.headers.host;
    key[host] = crypto.newKeyPair();
    const p = crypto.getPubKey(key[host]);
    res.statusCode = 200;
    res.end(p);
}

module.exports = {
    addNewAsset: addNewAsset,
    getServerPublicKey
}