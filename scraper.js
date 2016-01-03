var request = require('request'),
iconv = require('iconv-lite'),
util = require('./util');

// Variables used in this module
var _cookieUrl = 'http://services.science.au.dk/apps/skema/VaelgElevskema.asp?webnavn=skema',
_dataUrl = 'http://services.science.au.dk/apps/skema/ElevSkema.asp',
_className = 'SCRAPER',
_auCookie = '';

//Request data from the schedule service at AU
function getSceduleData(studentNumber, callback) {

  //Creating a cookie and setting the URL to use
  var j = request.jar();
  var cookie = request.cookie(_auCookie);
  j.setCookie(cookie, _dataUrl);

  //Setting the options for the request
  var options = {
    url: _dataUrl,
    encoding: null,
    jar: j,
    form: {'B1': 'S%F8g', 'aarskort': studentNumber},
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //Converting the response from the server, to show the letters æøå correct
      var output = iconv.decode(body, 'iso-8859-1');
      var res = output.toString('utf-8');

      util.logInfo(_className, 'Succesfully scraped the AU website');
      callback(null, res);
    } else {
      util.logError(_className, 'An error occured while scraping');
      callback(error);
    }
  });
}

//Function used to update the cookie
function updateCookie() {
  request.post(_cookieUrl, function (error, response) {
    if (!error && response.statusCode == 200) {
      _auCookie = response.headers['set-cookie'][0].split(';')[0];
      util.logInfo(_className,'Updated cookie');
    } else {
      util.logError(_className, 'Could not retrieve cookie');
    }
  });
}

module.exports = {
  getSceduleData: getSceduleData,
  updateCookie: updateCookie
};
