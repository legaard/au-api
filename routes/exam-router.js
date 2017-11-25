const express = require('express');

const crawler = require('../utils/crawler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/:quarter/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const quarter = req.params.quarter;

    crawler.getExamData(quarter, studentId)
        .then((data) => {
            res.send(data);
            logger.info(`successfully served exams (quarter: ${quarter}) for student: ${studentId}`);
        })
        .catch((error) => {
            res.status(404).send({error});
            logger.warn(`failed to served exams (quarter: ${quarter}) for student: ${studentId}`);         
        });
});

module.exports = router;