require('./connector');
const file = require('./schemas/file');

const File = {
    add: (hash, name, fileData) => {
        file.find({}, (err, doc) => {
            const collection = doc[0];

            if (collection !== undefined) {
                const fileObject = collection.files;
                fileObject[HexToBase64(hash)] = {
                    name: name,
                    data: fileData
                };
                file.updateOne({}, {files: collection.files}, (err, doc) => {
                })
            } else {
                const fileObject = {};
                fileObject[HexToBase64(hash)] = {
                    name: name,
                    data: fileData
                };
                file.create({files: fileObject}, (err, doc) => {
                })
            }
        })
    },
    getOne: (hash) => {
        return new Promise((resolve, reject) => {
            file.find({}, (err, doc) => {
                const files = doc[0].files;
                const file = files[hash];
                if (file !== undefined)
                    resolve(file);
                else
                    reject({});
            });
        });
    },
    getAll: async () => {
        const response = await file.find({}, (err, doc) => { });
        return response[0].files;
    }
};

function HexToBase64(str) {
    return Buffer.from(str, 'hex').toString('base64')
}


module.exports = {
    file: File
}