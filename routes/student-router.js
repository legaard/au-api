const express = require('express');

const crawler = require('../utils/crawler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    crawler.getCourseData(studentId)
        .then((data) => {
            res.send({studentName: data.studentName});
            logger.info(`successfully served student name for studentUd: ${studentId}`);
        })
        .catch((error) => {
            res.status(404).send({error});
            logger.warn(`failed to served class data for classId: ${classId}`);         
        });
});

module.exports = router;