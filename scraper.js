var request = require('request'),
iconv = require('iconv');

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
    form: {'B1' : 'S%F8g', 'aarskort' : studentNumber},
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //Converting the response from the server, to show the letters æøå correct
      var ic = new iconv.Iconv('iso-8859-1', 'utf-8');
      var buf = ic.convert(body);
      var res = buf.toString('utf-8');

      callback(null, res);
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

module.exports = {
  getSceduleData: getSceduleData,
  updateCookie: updateCookie
};
