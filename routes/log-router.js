const express = require('express');

const logger = require('../utils/logger');
const authHandler = require('../utils/handlers/authorization-handler');

const router = express.Router();

router.use(authHandler);
router.use((req, res, next) => {
    req.body = JSON.stringify(req.body);
    next();
});

router.post('/info', (req, res) => {
    logger.info(`message from app: ${req.body}`);
    res.sendStatus(200);
});

router.post('/warn', (req, res) => {
    logger.warn(`message from the app: ${req.body}`);
    res.sendStatus(200);
});

router.post('/error', (req, res) => {
    logger.error(`message from the app: ${req.body}`);
    res.sendStatus(200);
});

module.exports = router;