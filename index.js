const cors = require('cors');
const express = require('express');
const network = require('network');
const bodyParser = require('body-parser');

const classRouter = require('./routes/class-router');
const studentRouter = require('./routes/student-router');
const courseRouter = require('./routes/course-router');
const errorRouter = require('./routes/error-router');
const examRouter = require('./routes/exam-router');
const testRouter = require('./routes/test-router');
const logger = require('./utils/logger');

const app = express();
const port = process.argv[2] || 8080;
const apiVersion = 'v1';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static('public'));

app.use(`/api/${apiVersion}/classes`, classRouter);
app.use(`/api/${apiVersion}/students`, studentRouter);
app.use(`/api/${apiVersion}/courses`, courseRouter);
app.use(`/api/${apiVersion}/exams`, examRouter);
app.use(`/api/${apiVersion}/error`, errorRouter);
app.use(`/api/${apiVersion}/test`, testRouter);


app.use((req, res, next) => {
  const error = new Error(`page not found: ${req.originalUrl} - requested by IP ${req.ip}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.sendStatus(err.status || 500);
});

app.listen(port, () => {
  network.get_public_ip((error, ip) => {
    if(!error){
      logger.info(`server is running on ${ip}:${port}`);
    } else {
      logger.error(error.message);
    }
  });
});
