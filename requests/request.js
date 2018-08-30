const rp = require('request-promise');
require('dotenv').config();

const AUTH = process.env.AUTH;

const addAsset = async (assetID, hash) => request('POST', `http://ec2-18-210-150-89.compute-1.amazonaws.com:8080/a/new/${assetID}/${hash}`);

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
    addAsset: addAsset
};