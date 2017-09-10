const express = require('express');

const crawler = ('../utils/crawler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', (req, res) => {
    // log the error from the front-end
    res.end(200);
});

module.exports = router;