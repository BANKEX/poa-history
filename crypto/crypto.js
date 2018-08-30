const NodeRSA = require('node-rsa');

const decrypt = (privateKey, encryptedData) => privateKey.decrypt(encryptedData, 'utf8');

const toNodeRSAPubKey = (publicKey) => new NodeRSA(publicKey, 'pkcs1-public');

const verify = (data, signature, publicKey) => publicKey.verify(data, signature);

const newKeyPair = () =>  new NodeRSA({b: 1024});

const getPubKey = (keyPair) => keyPair.exportKey('pkcs1-public');

module.exports = {
    decrypt: decrypt,
    toNodeRSAPubKey: toNodeRSAPubKey,
    verify: verify,
    newKeyPair,
    getPubKey
};