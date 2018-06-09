const express = require('express');

const classRouter = require('./class-router');
const studentRouter = require('./student-router');
const logRouter = require('./log-router');
const testRouter = require('./test-router');
const logger = require('../../utils/logger');

const router = express.Router();
const version = '1';

router.use(`/v${version}/classes`, classRouter);
router.use(`/v${version}/students`, studentRouter);
router.use(`/v${version}/log`, logRouter);
router.use(`/v${version}/test`, testRouter);

module.exports = router;