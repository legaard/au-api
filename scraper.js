var request = require('request'),
    iconv = require('iconv-lite'),
    Q = require('q'),
    logger = require('./logger');

// Variables used in this module
var _domain = 'http://timetable.scitech.au.dk',
    _examAndScheduleUrl = _domain + '/apps/skema/ElevSkema.asp',
    _classUrl = _domain + '/apps/skema/holdliste.asp',

    _examSessionUrl =  _domain + '/apps/skema/VaelgelevSkema.asp?webnavn=EKSAMEN',
    _scheduleSessionUrl = _domain + '/apps/skema/VaelgelevSkema.asp?webnavn=skema',
    _className = 'SCRAPER',

    j = request.jar(),
    timeoutThreshold = 30000;

//Request data from the schedule service at AU
function getSceduleData(studentNumber) {
  var deferred = Q.defer();

  //Update session and set url
  _updateCookieAndSession(_scheduleSessionUrl)
  .then(function(){

    //Setting the options for the request
    var options = {
      url: _examAndScheduleUrl,
      encoding: null,
      jar: j,
      timeout: timeoutThreshold,
      form: {'B1': 'S%F8g', 'aarskort': studentNumber}
    };

    request.post(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //Converting the response from the server, to show the letters æøå correct
        var res = _decode(body);
        deferred.resolve(res);
        logger.logInfo(_className, 'Successfully scraped the schedule site');
      } else {
        deferred.reject(new Error('The AU server is not responding'));
        logger.logError(_className, 'An error occured while scraping for schedule data');
      }
    });
  })
  .catch(function(error){
    deferred.reject(error);
    logger.logError(_className, 'Could not retrieve cookie and set session');
  });

  return deferred.promise;
}


function getExamData(studentNumber, quarter, callback){
  var deferred = Q.defer();

  //Update the cookie and set the session to exam
  _updateCookieAndSession(_examSessionUrl + quarter + '&sprog=da')
  .then(function(){

    //Setting the options for the request
    var options = {
      url: _examAndScheduleUrl,
      encoding: null,
      jar: j,
      timeout: timeoutThreshold,
      form: {'B1': 'S%F8g', 'aarskort': studentNumber}
    };

    request.post(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //Converting the response from the server, to show the letters æøå correct
        var res = _decode(body);
        deferred.resolve(res);
        logger.logInfo(_className, 'Successfully scraped the exam site');
      } else {
        deferred.reject(new Error('The AU server is not responding'));
        logger.logError(_className, 'An error occured while scraping for exam data');
      }
    });
  })
  .catch(function(error){
    deferred.reject(error);
    logger.logError(_className, 'Could not retrieve cookie and set session');
  });

  return deferred.promise;
}

function getClassData(classID, classGroup, group){
  var deferred = Q.defer();

  var options = {
    url: _classUrl + '?udbud=' + classID + '&holdgruppe_da=' +
      _encodeToWindows1252(classGroup) + '&hold=' +
      _encodeToWindows1252(group),
    encoding: null,
    timeout: timeoutThreshold
  };

  request.get(options, function(error, response, body){
    if(!error && response.statusCode == 200){
      var res = _decode(body);
      deferred.resolve(res);
      logger.logInfo(_className, 'Successfully scraped the class site');
    } else {
      deferred.reject(new Error('The AU server is not responding'));
      logger.logError(_className, 'An error occured while scraping for class data');
    }
  });

  return deferred.promise;
}

//Function used to update the cookie
function _updateCookieAndSession(url) {
  var deferred = Q.defer();

  var options = {
    url: url,
    timeout: timeoutThreshold
  };

  request.get(options, function (error, response) {
    if (!error && response.statusCode == 200) {
      logger.logInfo(_className, 'Session set to: ' + url);

      var cookieString = response.headers['set-cookie'][0].split(';')[0];
      var cookie = request.cookie(cookieString);

      j.setCookie(cookie, _domain + '/apps/skema/');
      logger.logInfo(_className,'Updated cookie');

      deferred.resolve();
    } else {
      deferred.reject(new Error('AU\'s server responded with an error'));
    }
  });

  return deferred.promise;
}

//Decoding function: turns iso-8859-1 into utf-8
function _decode(data){
  var buffer = iconv.decode(data, 'iso-8859-1');
  return buffer.toString('utf-8');
}

function _encodeToWindows1252(stringToEncode){
  return stringToEncode
  .replace('Ø', '%D8')
  .replace('ø', '%F8')
  .replace('Å', '%C5')
  .replace('å', '%E5')
  .replace('Æ', '%C6')
  .replace('æ', '%E6');
}

module.exports = {
  getSceduleData: getSceduleData,
  getExamData: getExamData,
  getClassData: getClassData
};
