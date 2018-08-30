const web3 = new Web3();
const URL = 'http://localhost:3000';

const left = 0;
const right = 1;

let assetID;
let fileData;
let serverData;
function getAssetID() {
    const _assetID = document.getElementById('AssetId').value;
    if (_assetID != '')
        assetID = _assetID;
    else
        throw alert('Enter assetID');
}

async function moveData() {
    const data = await getFile();
    console.log(data)
    serverData = await sendData(data);
    console.log(serverData)
}

async function getFile() {
    return await p.getFile();
}

function verify(assetId, txNumber, data, timestamp) {
    const response = getData(assetId, txNumber, data, timestamp);
    const proof = response.Data;
    const key = Base64toHEX(response.Info.Key);
    const hash = Base64toHEX(response.Info.Hash);
    const root = Base64toHEX(response.Info.Root);
    const verify = verifyProof(proof, key, hash, root);
    return verify;
}

/**
 * Allows to get Merkle proofs
 * @param assetId {string} ID of verifiable asset
 * @param txNumber {string} Number of transaction
 * @param data {string} Verifiable data
 * @param timestamp {string} Time of adding data
 * @returns {Object}
 */
function getData(assetId, txNumber, data, timestamp) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "/proof" + "/" + assetId + "/" + txNumber + "/" + data + "/" + timestamp, false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}

/**
 * Allows to get varify of proof
 * @param proof {Array} 256 length array of nodes
 * @param key {string} Data key
 * @param data {string} Verifiable data
 * @param root {string} Merkle root hash
 * @returns {boolean} result of verifying
 */
function verifyProof(proof, key, data, root) {
    const rootHash = HexToUint8Array(root);
    const keyHash = getHash("0x" + key);
    let dataHash = getHash("0x" + data);

    if (proof.length != 256)
        return false;

    for (let i = 255; i >= 0; i--) {
        const node = Base64ToBinary(proof[i].Hash);
        if (node.length != 32)
            return false;
        let newArray;
        if (hasBit(keyHash, i) == right)
            newArray = concatUint8Arrays(node, dataHash);
        else
            newArray = concatUint8Arrays(dataHash, node);
        const newHex = "0x" + Uint8ArrayToHex(newArray);
        dataHash = getHash(newHex);
    }

    return Uint8ArrayToHex(dataHash) === Uint8ArrayToHex(rootHash);
}

/**
 * Allows to find adjacent node
 * @param key Key value
 * @param position Current position
 * @returns {number} Left - 0, Right - 1
 */
function hasBit(key, position) {
    if (((key[parseInt(position / 8)]) & (1 << (position % 8))) > 0) {
        return 1
    }
    return 0
}

/**
 * Allows to hashing data via keccak256
 * @param data Any set of data
 * @return {Uint8Array} Hash of data
 */
function getHash(data) {
    const hash_hex = web3.utils.keccak256(data).substring(2);
    const hash_bytes = HexToUint8Array(hash_hex);
    return hash_bytes;
}

/**
 * Allows to convert base64 string into hex string
 * @param base64 {string} base64 data
 * @returns {string} hex data
 */
function Base64toHEX(base64) {
    const raw = window.atob(base64);
    var HEX = '';
    for (i = 0; i < raw.length; i++) {
        var _hex = raw.charCodeAt(i).toString(16)
        HEX += (_hex.length == 2 ? _hex : '0' + _hex);
    }
    return HEX.toLowerCase();
}

/**
 * Allows to convert base64 string into Uint8Array
 * @param data {string} base64
 * @returns {Uint8Array}
 */
function Base64ToBinary(data) {
    const raw = window.atob(data);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++)
        array[i] = raw.charCodeAt(i);
    return array;
}

/**
 * Allows to convert Uint8Array into Hex
 * @param array Uint8Array
 * @returns {string} Hex data
 */
function Uint8ArrayToHex(array) {
    return array.reduce(function (memo, i) {
        return memo + ('0' + i.toString(16)).slice(-2); //padd with leading 0 if <16
    }, '');
}

/**
 * Allows to convert hex data into Uint8Array
 * @param hexString Hex data
 * @returns {Uint8Array}
 */
function HexToUint8Array(hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

/**
 * Allows to join two arrays
 * @param a First array
 * @param b Second array
 * @returns {Uint8Array}
 */
function concatUint8Arrays(a, b) {
    const arr64 = new Uint8Array(a.length + b.length);
    for (let i = 0; i < 64; i++) {
        if (i < 32)
            arr64[i] = a[i];
        else
            arr64[i] = b[i - 32];
    }
    return arr64;
}

class PoA {
    /**
     * Allows to get file
     */
    getFile() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const file = document.querySelector('input[type=file]').files[0];
            if (!file)
                throw new Error('You didn\'t add a file');
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    }

    /**
     * Allows to hashing data via keccak256
     * @param data Any set of data
     * @return {*} Hash of data
     */
    getHash(data) {
        return web3.utils.keccak256(data);
    }
}

const p = new PoA();

function getCell1(assetId, txNumber) {
    const a = p.getHash(txNumber);
    const b = p.getHash(assetId);
    return p.getHash(a.substring(2) + b.substring(2));
}

// function getCell(assetId, txNumber) {
//     const a = getHash(txNumber);
//     const b = getHash(assetId);
//     const concatArray = concatUint8Arrays(a, b);
//     const key = getHash("0x" + Uint8ArrayToHex(concatArray));
//     return "0x" + Uint8ArrayToHex(key);
// }

async function sendData(data) {
    const publicKey = await getServerPublicKey();
    console.log(publicKey)
    const enctyptedData = encryptData(publicKey, data);
    const clientKeyPair = newClientKeyPair();
    const signature = signData(clientKeyPair, data);
    const clientPublicKey = getClientPublicKey(clientKeyPair);
    const JSON_data = JSON.stringify({
        data: enctyptedData,
        signature: signature,
        clientPubKey: clientPublicKey
    });
    const response = await query('POST', URL + '/data', JSON_data);
    return response;
}

async function getServerPublicKey() {
    try {
        return await query('GET', URL + '/getPubKey');
    } catch (e) {
        throw new Error('Cannot get server public key');
    }
}

function newClientKeyPair() {
    return new NodeRSA.RSA({b: 1024});
}

function getClientPublicKey(clientKeyPair) {
    return clientKeyPair.exportKey('pkcs1-public');
}

function encryptData(serverPublicKey, data) {
    const key = new NodeRSA.RSA(serverPublicKey, 'pkcs1-public');
    return key.encrypt(data, 'base64');
}

function signData(clientKey, data) {
    return clientKey.sign(data);
}

async function query(method, url, data) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": method,
        "processData": false,
    };

    if (data) {
        settings.data = data;
        settings.headers = {
            "Content-Type": "application/json"
        };
    }

    const result = await $.ajax(settings);
    return result;
};





