var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var File = new Schema({
    files: {
      type: Object
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('File', File);