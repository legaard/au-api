const express = require('express');

const crawler = require('../../utils/crawler');
const logger = require('../../utils/logger');

const router = express.Router();

router.get('/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    crawler.getCourseData(studentId)
        .then((data) => {
            res.send({studentName: data.studentName});
            logger.info(`successfully served student name for studentId: ${studentId}`);
        })
        .catch((error) => {
            res.status(404).send({error});
            logger.warn(`failed to serve data for studentId: ${classId}`);         
        });
});

router.get('/:studentId/courses', (req, res) => {
    const studentId = req.params.studentId;

    crawler.getCourseData(studentId)
        .then((data) => {
            res.send(data);
            logger.info(`successfully served courses for student: ${studentId}, ${data.studentName}`);
        })
        .catch((error) => {
            res.status(404).send({error});
            logger.warn(`failed to serve courses for student: ${studentId}`);
        });
});

router.get('/:studentId/exams', (req, res) => {
    const studentId = req.params.studentId;
    const periode = req.query.periode;

    if (!periode) {
        res.status(404).send('Request must contain "periode" as query param, e.g. periode=summer');
    }

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