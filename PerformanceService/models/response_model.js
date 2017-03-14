let mongoose = require('mongoose');

let responseSchema = mongoose.Schema({

    id: String,
    name: String,
    url: String,
    repetitions: Number,
    times: Array
});

module.exports = mongoose.model('ResponseModel', responseSchema);