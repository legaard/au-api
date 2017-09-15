const express = require('express');

const crawler = require('../utils/crawler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    crawler.getCourseData(studentId)
        .then((data) => {
            res.send(data);
            logger.info(`successfully served courses for student: ${studentId}`);
        })
        .catch((error) => {
            res.status(300).send({error});
            logger.warn(`failed to serve courses for student ${studentId}`);
        });
});

module.exports = router;