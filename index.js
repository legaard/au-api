const express = require('express');
const network = require('network');
const bodyParser = require('body-parser');

const classRouter = require('./routes/class-router.js');
const courseRouter = require('./routes/course-router.js');
const errorRouter = require('./routes/error-router.js');
const examRouter = require('./routes/exam-router.js');
const testRouter = require('./routes/test-router.js');
const logger = require('./utils/logger');

const app = express();
const port = process.argv[2] || 8080;
const apiVersion = 'v1';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static('public'));
app.use(`/api/${apiVersion}/classes`, classRouter);
app.use(`/api/${apiVersion}/courses`, courseRouter);
app.use(`/api/${apiVersion}/exams`, examRouter);
app.use(`/api/${apiVersion}/error`, errorRouter);
app.use(`/api/${apiVersion}/test`, testRouter);

/* start server and log ip address */
app.listen(port, () => {
  network.get_public_ip((error, ip) => {
    if(!error){
      logger.info(`server is running on ${ip}:${port}`);
    } else {
      logger.error(error.message);
    }
  });
});
