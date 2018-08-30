require('./connector');
const file = require('./schemas/file');

const File = {
    add: (hash, fileData) => {
        file.find({}, (err, doc) => {
            const collection = doc[0];

            if (collection !== undefined) {
                const fileObject = collection.files;
                fileObject[hash] = fileData;
                file.updateOne({}, {files: collection.files}, (err, doc) => {})
            } else {
                const fileObject = {};
                fileObject[hash] = fileData;
                file.create({files: fileObject}, (err, doc) => {})
            }
        })
    },
    getOne: (hash) => {
        new Promise((resolve, reject) => {
            file.find({}, (err, doc) => {
                const files = doc[0].files;
                const file = files[hash];
                if (file !== undefined)
                    resolve(file);
                else
                    reject('');
            });
        });
    },
    getAll: () => {
        new Promise((resolve, reject) => {
            file.find({}, (err, doc) => {
                if (err) {
                    reject(err);
                    return;
                }

                const files = doc[0].files;
                resolve(files);
            });
        });
    }
}

module.exports = {
    file: File
}