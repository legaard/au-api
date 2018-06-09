const express = require('express');

const crawler = require('../../utils/crawler');
const logger = require('../../utils/logger');

const router = express.Router();

router.get('/:classId/class-groups/:classGroup/groups/:group', (req, res) => {
    const classId = req.params.classId;
    const classGroup = req.params.classGroup;
    const group = req.params.group;

    crawler.getClassData(classId, classGroup, group)
        .then((data) => {
            res.send(data);
            logger.info(`successfully served class data for class: ${classId}/${classGroup}/${group}`);
        })
        .catch((error) => {
            res.status(404).send({error});
            logger.warn(`failed to served class data for class: ${classId}/${classGroup}/${group}`);         
        });
});

module.exports = router;