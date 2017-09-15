const express = require('express');

const logger = require('../utils/logger');

const router = express.Router();

router.post('/', (req, res) => {
    let appName = req.body.appName;
    let error = req.body.error;

    if (typeof error === 'object') error = JSON.stringify(error);

    logger.error(`message from the app \"${appName}\": ${error}`);
    res.sendStatus(200);
});

module.exports = router;