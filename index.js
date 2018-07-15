const cors = require('cors');
const express = require('express');
const network = require('network');
const bodyParser = require('body-parser');

const v1Router = require('./routes/v1/v1-router');
const logger = require('./utils/logger');

const app = express();
const port = process.argv[2] || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static('public'));
app.use('/api', v1Router);

app.use((req, res, next) => {
  logger.warn(`page not found: ${req.originalUrl} - requested by IP ${req.ip}`);
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  logger.error(`internal error\n${err.stack}`);
  res.sendStatus(500);
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
