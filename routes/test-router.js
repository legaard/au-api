const fs = require('fs');
const express = require('express');

const logger = require('../utils/logger');

const router = express.Router();

router.get('/classes', (req, res) => {
    fs.readFile(`${__dirname}/../assets/tests/classes.json`, 'utf8', (error, data) => {
        if (error) {
            logger.error(error);
            res.sendStatus(500);
            return;
        }
        res.send(JSON.parse(data));
    }); 
});

router.get('/courses', (req, res) => {
    fs.readFile(`${__dirname}/../assets/tests/courses.json`, 'utf8', (error, data) => {
        if (error) {
            logger.error(error);
            res.sendStatus(500);
            return;
        }
        res.send(JSON.parse(data));
    }); 
});

router.get('/exams', (req, res) => {
    fs.readFile(`${__dirname}/../assets/tests/exams.json`, 'utf8', (error, data) => {
        if (error) {
            logger.error(error);
            res.sendStatus(500);
            return;
        }
        res.send(JSON.parse(data));
    }); 
});

module.exports = router;