const express = require('express');

const crawler = require('../utils/crawler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/:periode/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const periode = req.params.periode;

    crawler.getExamData(periode, studentId)
        .then((data) => {
            res.send(data);
            logger.info(`successfully served exams (periode: ${periode}) for student: ${studentId}, ${data.studentName}`);
        })
        .catch((error) => {
            res.status(404).send({error});
            logger.warn(`failed to served exams (periode: ${periode}) for student: ${studentId}`);         
        });
});

module.exports = router;