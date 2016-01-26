var request = require('request'),
    iconv = require('iconv-lite'),
    Q = require('q'),
    logger = require('./logger');

// Variables used in this module
var _examAndScheduleUrl = 'http://services.science.au.dk/apps/skema/ElevSkema.asp',
    _examSessionUrl = 'http://services.science.au.dk/apps/skema/VaelgelevSkema.asp?webnavn=EKSAMEN',
    _scheduleSessionUrl = 'http://services.science.au.dk/apps/skema/VaelgelevSkema.asp?webnavn=skema',
    _className = 'SCRAPER',
     j = request.jar();

//Request data from the schedule service at AU
function getSceduleData(studentNumber) {
  var deferred = Q.defer();

  //Setting the options for the request
  var options = {
    url: _examAndScheduleUrl,
    encoding: null,
    jar: j,
    form: {'B1': 'S%F8g', 'aarskort': studentNumber},
  };

  //Update session and set url
  _updateCookieAndSession(_scheduleSessionUrl)
  .then(function(){
    request.post(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //Converting the response from the server, to show the letters æøå correct
        var res = _decode(body);
        deferred.resolve(res);
        logger.logInfo(_className, 'Succesfully scraped the schedule website');
      } else {
        deferred.reject(error);
        logger.logError(_className, 'An error occured while scraping');
      }
    })
    .catch(function(){
      logger.logError(_className, 'Could not retrieve cookie and set session');
    });
  });

  return deferred.promise;
}

function getExamData(studentNumber, quarter, callback){

  var deferred = Q.defer();

  var options = {
    url: _examAndScheduleUrl,
    encoding: null,
    jar: j,
    form: {'B1': 'S%F8g', 'aarskort': studentNumber},
  };

  //Update the cookie and set the session to exam
  _updateCookieAndSession(_examSessionUrl + quarter + '&sprog=da')
  .then(function(){
    request.post(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //Converting the response from the server, to show the letters æøå correct
        var res = _decode(body);
        deferred.resolve(res);
        logger.logInfo(_className, 'Succesfully scraped the exam website');
      } else {
        deferred.reject(error);
        logger.logError(_className, 'An error occured while scraping the exam website');
      }
    })
    .catch(function(){
      logger.logError(_className, 'Could not retrieve cookie and set session');
    });
  });

  return deferred.promise;
}

//Function used to update the cookie
function _updateCookieAndSession(url) {
  var deferred = Q.defer();

  request.get(url, function (error, response) {
    if (!error && response.statusCode == 200) {
      logger.logInfo(_className, 'Session set to: ' + url);

      var cookieString = response.headers['set-cookie'][0].split(';')[0];
      var cookie = request.cookie(cookieString);

      j.setCookie(cookie, 'http://services.science.au.dk/apps/skema/');
      logger.logInfo(_className,'Updated cookie');

      deferred.resolve();
    } else {
      deferred.reject(error);
    }
  });

  return deferred.promise;
}

//Decoding function: turns iso-8859-1 into utf-8
function _decode(data){
  var buffer = iconv.decode(data, 'iso-8859-1');
  return buffer.toString('utf-8');
}

module.exports = {
  getSceduleData: getSceduleData,
  getExamData: getExamData
};
