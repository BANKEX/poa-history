const toBuffer = require('typedarray-to-buffer');
const crypto = require('./../crypto/crypto');
const request = require('./../requests/request');
const db = require('./../database/database');

const key = {};

async function addNewAsset(req, res) {
    const body = req.body;

    const host = req.headers.host;

    const assetID = body.assetID;
    const name = body.name;
    const hash = body.hash;
    const encryptedData = body.data;
    const clientPubKey = crypto.toNodeRSAPubKey(body.clientPubKey);
    const signature = toBuffer(body.signature);
    const data = crypto.decrypt(key[host], encryptedData);
    const verify = crypto.verify(data, signature, clientPubKey);

    if (!verify) {
        res.statusCode = 401;
        res.send('Verify is invalid');
        return;
    }

    const response = await request.addAsset(assetID, hash);
    db.file.add(hash, name, toBuffer(data));
    res.statusCode = 200;
    res.send(response);
}

function getServerPublicKey(req, res) {
    const host = req.headers.host;
    key[host] = crypto.newKeyPair();
    const p = crypto.getPubKey(key[host]);
    res.statusCode = 200;
    res.send(p);
}

async function getAssets(req, res) {
    const body = req.params;

    const assetID = body.assetID;

    const response = await request.getAssets();

    const assets = response.assets;

    let requestedAssets;
    for (let i in assets) {
        if (assets[i].assetId === assetID) {
            requestedAssets = assets[i].assets;
            break;
        }
    }

    if (requestedAssets != undefined) {
        const sendData = [];
        const files = await db.file.getAll();
        for (let j in assets) {
            for (let i in files) {
                if (i === requestedAssets[j]) {
                    sendData.push({
                        hash: i,
                        name: files[i].name,
                        txNumber: j
                    });
                }
            }
        }

        res.statusCode = 200;
        res.send(sendData);
    } else {
        res.send([]);
    }
}

async function getFile(req, res) {
    const body = req.params;

    const fileHash = Buffer.from(body.hash, 'hex').toString('base64');
    const file = await db.file.getOne(fileHash);
    const fileData = file.data;

    res.statusCode = 200;
    res.write(fileData.buffer, 'binary');
    res.end();
}

async function getProof(req, res) {
    const body = req.params;

    const assetID = body.assetID;
    const txNumber = body.txNumber;
    const hash = body.hash;
    const timestamp = body.timestamp;

    try {
        const proof = await request.getProof(assetID, txNumber, hash, timestamp);

        res.statusCode = 200;
        res.send(proof);
    } catch (e) {
        res.statusCode = 400;
        res.send(undefined);
    }
}

module.exports = {
    addNewAsset: addNewAsset,
    getServerPublicKey,
    getAssets: getAssets,
    getFile: getFile,
    getProof: getProof
}

