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
            if (!data) {
                res.sendStatus(404);
                logger.info(`no class data for ${classId}/${classGroup}/${group}`);
                return;
            }

            res.json(data);
            logger.info(`successfully served class data for class: ${classId}/${classGroup}/${group}`);
        })
        .catch((error) => {
            res.status(500).json({message: error});
            logger.warn(`failed to served class data for class: ${classId}/${classGroup}/${group}`);         
        });
});

module.exports = router;