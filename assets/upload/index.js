const web3 = new Web3();
const URL = 'https://productdb.bankex.team';

/**
 * Allows to send client data to server and get response
 * @returns {Promise<void>}
 */
async function moveData() {
    const file = (await getFile());
    const serverData = await sendData(file.data, file.name);
    console.log(serverData)
    document.getElementById('data').innerHTML += ` 
    <li id="show3">
        <h2 class="Asker">Save this information</h2>
        <div class="container">
            <div class="row">
                <table class="table table-bordered">
                    <tbody>
                    <tr>
                        <td class="er" data-clipboard-text="0x${serverData.hash}"><strong>Hash:</strong> 0x${serverData.hash === undefined ? p.getHash(file.data).substring(2) : serverData.hash}</td>
                        <td class="er" data-clipboard-text="${serverData.timstamp}"><strong> Timestamp:</strong> ${serverData.timstamp === undefined ? serverData.timestamp : serverData.timstamp}</td>
                        <td class="er" data-clipboard-text="${serverData.txNumber}"><strong> Tx Number:</strong> ${serverData.txNumber}</td>
                        <td class="er" data-clipboard-text="${serverData.assetId}"><strong> Asset Id:</strong> ${serverData.assetId}</td>
                    </tr>
                    </tbody>
                </table>
                <div class="text-center col-12">
                    <button class="btn btn-lg btn-info" onclick="$('.er').CopyToClipboard()" data-clipboard-target=".er">Copy</button>
                </div>
            </div>
        </div
    </li>`
}

/**
 * Get client file data
 * @returns {Promise<String>} file data (base64)
 */
async function getFile() {
    return await p.getFile();
}

let assetID;
/**
 * Allows to get assetID from client
 */
function getAssetID() {
    const _assetID = document.getElementById('AssetId').value;
    if (_assetID != '')
        assetID = _assetID;
    else
        throw alert('Enter assetID');
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
    const proof = await query("GET", URL + "/proof" + "/" + assetId + "/" + txNumber + "/" + data + "/" + timestamp);
    return proof;
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
                resolve({data: reader.result, name: file.name});
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
    return p.getHash(a.substring(2) + b.substring(2));
}

/**
 * Send data, data hash and assetID to server
 * @param data file data
 * @returns {Promise<Object>}
 */
async function sendData(data, name) {
    const publicKey = await getServerPublicKey();
    const enctyptedData = encryptData(publicKey, data);
    const clientKeyPair = newClientKeyPair();
    const signature = signData(clientKeyPair, data);
    const clientPublicKey = getClientPublicKey(clientKeyPair);
    const JSON_data = JSON.stringify({
        name: name,
        data: enctyptedData,
        signature: signature,
        clientPubKey: clientPublicKey,
        assetID: assetID,
        hash: p.getHash(data).substring(2)
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
