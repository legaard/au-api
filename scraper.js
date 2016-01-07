var request = require('request'),
    iconv = require('iconv-lite'),
    logger = require('./logger');

// Variables used in this module
var _cookieUrl = 'http://services.science.au.dk/apps/skema/VaelgElevskema.asp?webnavn=skema',
    _scheduleUrl = 'http://services.science.au.dk/apps/skema/ElevSkema.asp',
    _auCookie = '',
    _className = 'SCRAPER';

//Request data from the schedule service at AU
function getSceduleData(studentNumber, callback) {

  //Creating a cookie and setting the URL to use
  var j = request.jar();
  var cookie = request.cookie(_auCookie);
  j.setCookie(cookie, _scheduleUrl);

  //Setting the options for the request
  var options = {
    url: _scheduleUrl,
    encoding: null,
    jar: j,
    form: {'B1': 'S%F8g', 'aarskort': studentNumber},
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //Converting the response from the server, to show the letters æøå correct
      var output = iconv.decode(body, 'iso-8859-1');
      var res = output.toString('utf-8');

      logger.logInfo(_className, 'Succesfully scraped the AU website');
      callback(null, res);
    } else {
      logger.logError(_className, 'An error occured while scraping');
      callback(error);
    }
  });
}

//Function used to update the cookie
function updateCookie() {
  request.post(_cookieUrl, function (error, response) {
    if (!error && response.statusCode == 200) {
      _auCookie = response.headers['set-cookie'][0].split(';')[0];
      logger.logInfo(_className,'Updated cookie');
    } else {
      logger.logError(_className, 'Could not retrieve cookie');
    }
  });
}

module.exports = {
  getSceduleData: getSceduleData,
  updateCookie: updateCookie
};
