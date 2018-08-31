const web3 =  new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/1u84gV2YFYHHTTnh8uVl'));
const NODE_URL = 'http://23.100.12.138:3000';

const left = 0;
const right = 1;

async function checkAssetForIdentity() {
    const assetID = document.getElementById('AssetId2').value;
    const txNumber = document.getElementById('TxNumber').value;
    const timestamp = document.getElementById('Timestamp').value;
    const assetHash = document.getElementById('File hash').value;

    const hash = await getRootHash();

    try {
        const verifyObject = await verify(assetID, txNumber, assetHash.substring(2), timestamp);
        const enteredRoot = verifyObject.enteredRoot;
        const generatedRoot = verifyObject.generatedRoot;
        const proof = verifyObject.proof;

        document.getElementById('proofs').innerText = JSON.stringify(proof);
        document.getElementById('fromBlockchain').innerText = hash;
        document.getElementById('generatedHash').innerText = '0x' + generatedRoot;

        if (enteredRoot === generatedRoot && enteredRoot === hash.substring(2))
            document.getElementById('verified').innerText = 'YES';
        else
            document.getElementById('verified').innerText = 'NO';

        $('#final-check').show();
    } catch (e) {
        alert('This asset don\'t find');
    }
}

async function getRootHash() {
    const instance = new web3.eth.Contract(ABI, ADDRESS);
    return await instance.methods.getRootHash().call();
}

async function checkFileForIdentity() {
    const fileHash = document.getElementById('hash').innerText;
    const inputHash = document.getElementById('HashCheck2').value;
    if (fileHash !== inputHash) {
        alert('File was forged!')
        return;
    }

    $('#click3').hide();
    $('#show3').show();
}

async function downloadFile(fileHash, fileName) {
    const file = await getFileFromServer(fileHash);
    download(fileName, file);
    const hash = p.getHash(file);
    document.getElementById('hash').innerText = hash;
    $('#file-hash').show();
    $('#click3').show();
}

function download(filename, data) {
    const pom = document.createElement('a');
    pom.setAttribute('href', data);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

async function setData() {
    const assetID = document.getElementById('AssetId').value;
    console.log(assetID)
    if (assetID == '') {
        alert('Enter assetID');
        return;
    }

    const assets = await getAssets(assetID);

    if (assets.length === 0) {
        alert('This assetID doesn\'t exist');
        return;
    }

    $('#click2').hide();
    $('#show2').show();
    $('#click3').hide();

    for (let i in assets) {
        document.getElementById('assets').innerHTML += `
        <tr>
            <td>${assets[i].name}</td>
            <td>${assets[i].txNumber}</td>
            <td class="text-center">
                <button onclick="downloadFile('${Base64toHEX(assets[i].hash)}', '${assets[i].name}')" class="btn btn-default btn-circle btn-sm btn-info">Download</button>
            </td>
        </tr>
    `;
    }
}

async function verify(assetId, txNumber, data, timestamp) {
    const response = await getData(assetId, txNumber, data, timestamp);
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
async function getData(assetId, txNumber, data, timestamp) {
    const proof = await query("GET", NODE_URL + "/proof" + "/" + assetId + "/" + txNumber + "/" + data + "/" + timestamp);
    return proof;
}

/**
 * Allows to get varify of proof
 * @param proof {Array} 256 length array of nodes
 * @param key {string} Data key
 * @param data {string} Verifiable data
 * @param root {string} Merkle root hash
 * @returns {Object} result of verifying
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

    return ({
        enteredRoot: Uint8ArrayToHex(rootHash),
        generatedRoot: Uint8ArrayToHex(dataHash),
        proof: proof
    })
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

/**
 * Get asset hash on client side
 * @param assetId Name of asset
 * @param txNumber tx Number
 * @returns {*} hash
 */
function getCell(assetId, txNumber) {
    const a = p.getHash(txNumber);
    const b = p.getHash(assetId);
    return p.getHash(a.substring(2) + b.substring(2)).substring(2);
}

/**
 * Send data, data hash and assetID to server
 * @param data file data
 * @returns {Promise<Object>}
 */
async function sendData(data) {
    const publicKey = await getServerPublicKey();
    const enctyptedData = encryptData(publicKey, data);
    const clientKeyPair = newClientKeyPair();
    const signature = signData(clientKeyPair, data);
    const clientPublicKey = getClientPublicKey(clientKeyPair);
    const JSON_data = JSON.stringify({
        data: enctyptedData,
        signature: signature,
        clientPubKey: clientPublicKey,
        assetID: assetID,
        hash: p.getHash(data).substring(2)
    });
    const response = await query('POST', NODE_URL + '/data', JSON_data);
    return response;
}

async function getServerPublicKey() {
    try {
        return await query('GET', NODE_URL + '/getPubKey');
    } catch (e) {
        throw new Error('Cannot get server public key');
    }
}

/**
 * Generate RSA key pair
 */
function newClientKeyPair() {
    return new NodeRSA.RSA({b: 1024});
}

/**
 * Get Public key from key pair
 * @param clientKeyPair RSA key pair
 * @returns {PromiseLike<JsonWebKey | ArrayBuffer> | PromiseLike<ArrayBuffer> | PromiseLike<JsonWebKey> | *}
 */
function getClientPublicKey(clientKeyPair) {
    return clientKeyPair.exportKey('pkcs1-public');
}

/**
 * Allows to encrypt data using RSA
 * @param serverPublicKey Public key of server side
 * @param data Data to encrypt
 * @returns {String} Encrypted data
 */
function encryptData(serverPublicKey, data) {
    const key = new NodeRSA.RSA(serverPublicKey, 'pkcs1-public');
    return key.encrypt(data, 'base64');
}

/**
 * Allows to sign data using RSA
 * @param clientKey client Private key (key pair)
 * @param data Data to sign
 * @returns {Object} Sign data
 */
function signData(clientKey, data) {
    return clientKey.sign(data);
}

/**
 * Allows to get assets by Asset id
 * @param assetID Asset name
 * @returns {Promise<Object>} assets
 */
async function getAssets(assetID) {
    console.log(assetID)
    return await query('GET', NODE_URL + '/getAssets/' + assetID);
}

async function getFileFromServer(hash) {
    return await query('GET', NODE_URL + '/getFile/' + hash);
}

/**
 * Request to server side
 * @param method Using method
 * @param url URL to send
 * @param data request data
 * @returns {Promise<*>}
 */
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
