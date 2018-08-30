const rp = require('request-promise');
require('dotenv').config();

const AUTH = process.env.AUTH;
const GO_SERVER = process.env.GO_SERVER;

const addAsset = async (assetID, hash) => await request('POST', `${GO_SERVER}/a/new/${assetID}/${hash}`);

const getAssets = async () => await request('GET', `${GO_SERVER}/list`);

const getProof = async (assetID, txNumber, hash, timestamp) => await request('GET', `${GO_SERVER}/proof/${assetID}/${txNumber}/${hash}/${timestamp}`);

async function request(method, url) {
    const options = {
        uri: url,
        method: method,
        headers: {
            'Cache-Control': 'no-cache',
            Authorization: AUTH
        },
        json: true
    };

    return await rp(options);
}

module.exports = {
    addAsset: addAsset,
    getAssets: getAssets,
    getProof: getProof
};