const fs = require('fs');
const path = require('path');

const logger = require('../logger');

let apiKey;
fs.readFile(path.join(__dirname, '../../api.key'), 'utf8', (err, data) => { 
    if (!err) {
        apiKey = data;
    } else {
        throw new Error('No api key provided. Please add file \"api.key\" to the root folder');
    }
});

module.exports  = (req, res, next) => {
    if (req.headers['x-api-key'] === apiKey) {
        next();
    } else {
        res.sendStatus(401);
    }    
};
