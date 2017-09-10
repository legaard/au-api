const express = require('express');

const crawler = require('../utils/crawler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/:classId/:classGroup/:className', (req, res) => {
    const classId = req.params.classId;
    const classGroup = req.params.classGroup;
    const className = req.params.className;

    crawler.getClassData(classId, classGroup, className)
        .then((data) => {
            res.send(data);
            logger.info(`successfully served class data for classId:${classId}`);
        })
        .catch((error) => {
            res.status(400).send(error);
            logger.warn(`failed to served class data for classId:${classId}`);         
        });
});

module.exports = router;