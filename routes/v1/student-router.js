const express = require('express');

const crawler = require('../../utils/crawler');
const logger = require('../../utils/logger');

const router = express.Router();

router.get('/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    crawler.getCourseData(studentId)
        .then((data) => {
            if (!data) {
                res.sendStatus(404);
                logger.info(`student ${studentId} not found`);
                return;
            }

            res.json({studentName: data.studentName});
            logger.info(`successfully served student name for studentId: ${studentId}`);
        })
        .catch((error) => {
            res.status(500).json({message: error});
            logger.warn(`failed to serve data for studentId: ${classId}`);         
        });
});

router.get('/:studentId/courses', (req, res) => {
    const studentId = req.params.studentId;

    crawler.getCourseData(studentId)
        .then((data) => {
            if (!data) {
                res.sendStatus(404);
                logger.info(`course data not found for studentId: ${studentId}`);
                return;
            }

            res.json(data);
            logger.info(`successfully served courses for student: ${studentId}, ${data.studentName}`);
        })
        .catch((error) => {
            res.status(500).json({message: error});
            logger.warn(`failed to serve courses for student: ${studentId}`);
        });
});

router.get('/:studentId/exams', (req, res) => {
    const studentId = req.params.studentId;
    const periode = req.query.periode;

    if (periode) {
        crawler.getExamData(studentId, periode.toLowerCase())
            .then((data) => {
                if (!data) {
                    res.sendStatus(404);
                    logger.info(`exam data not found for studentId: ${studentId}`);
                    return;
                }

                res.json(data);
                logger.info(`successfully served exams (periode: ${periode}) for student: ${studentId}, ${data.studentName}`);
            })
            .catch((error) => {
                res.status(500).json({message: error});
                logger.warn(`failed to served exams (periode: ${periode}) for student: ${studentId}`);         
            });
    } else {
        crawler.getAllExamData(studentId)
            .then((data) => {
                if (!data) {
                    res.sendStatus(404);
                    logger.info(`exam data not found for studentId: ${studentId}`);
                    return;
                }
                res.json(data);
                logger.info(`successfully served exams (periode: ${periode}) for student: ${studentId}, ${data.studentName}`);
            })
            .catch((error) => {
                res.status(500).json({message: error});
                logger.warn(`failed to served exams (periode: ${periode}) for student: ${studentId}`);  
            });
    }
});

module.exports = router;