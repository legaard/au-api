var request = require('request');

// Variables used in this module
var _cookieUrl = 'http://services.science.au.dk/apps/skema/VaelgElevskema.asp?webnavn=skema',
_dataUrl = 'http://services.science.au.dk/apps/skema/ElevSkema.asp',
_auCookie = '',
_className = 'SCRAPER';

//Request data from the schedule service at AU
function getSceduleData(studentNumber, callback) {

  //Creating a cookie and setting the URL to use
  var j = request.jar();
  var cookie = request.cookie(_auCookie);
  j.setCookie(cookie, _dataUrl);

  //Setting the options for the request
  var options = {
    url: _dataUrl,
    jar: j,
    form: {'B1' : 'S%F8g', 'aarskort' : studentNumber},
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Language': 'da-DK,da;q=0.8,en-US;q=0.6,en;q=0.4'
    }
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, body);
    } else {
      callback(error);
    }
  });
}

//Function used to update the cookie
function updateCookie() {
  request.post(_cookieUrl, function (error, response) {
    if (!error && response.statusCode == 200) {
      _auCookie = response.headers['set-cookie'][0].split(';')[0];
      console.log(_className + ': Updated cookie');
    } else {
      console.log(_className + ': Could not retrieve cookie');
    }
  });
}

//Translate encoding

module.exports = {
  getSceduleData: getSceduleData,
  updateCookie: updateCookie
};
