var url = require('url'),
    builder = require('./builder'),
    scraper = require('./scraper'),
    logger = require('./logger');

var _className = 'HANDLER';

function handleRoot(request, response){
  var res = builder.createIndexResponse()
  .then(function(data){
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(data);
  })
  .catch(function(){
    response.writeHead(501, {'Content-Type': 'text/plan'});
    response.end(_className + ': Could not read index.html');
  });
}

function handleSchedule(request, response){
  var studentID = url.parse(request.url, true).query.studentID;
  var pretty = url.parse(request.url, true).query.pretty;

  if(_isURLParamsInvalid(studentID)){
    _dirtyURLResponse(response);
    return;
  }

  scraper.getSceduleData(studentID)
  .then(function(data){
    response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    var responseObject = builder.createScheduleObject(data);
    var res = _stringifyRespons(pretty, responseObject);
    response.end(res);
    logger.logInfo(_className, 'Served information. Student: ' + studentID);
  })
  .catch(function(){
    response.writeHead(501, {'Content-Type': 'text/plain'});
    response.end(_className + ': An error occured while scraping the AU website');
  });
}

function handleExam(request, response) {
  var studentID = url.parse(request.url, true).query.studentID;
  var quarter = url.parse(request.url, true).query.quarter;
  var pretty = url.parse(request.url, true).query.pretty;

  if(_isURLParamsInvalid(studentID) || _isURLParamsInvalid(quarter)){
    _dirtyURLResponse(response);
    return;
  }

  scraper.getExamData(studentID, quarter)
  .then(function(data){
    response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    var responseObject = builder.createExamObject(data);
    var res = _stringifyRespons(pretty, responseObject);
    response.end(res);
    logger.logInfo(_className, 'Served information. Student: ' + studentID);
  })
  .catch(function(error){
    response.writeHead(501, {'Content-Type': 'text/plain'});
    response.end(_className + ': An error occured while scraping the AU website');
  });
}

function handleParticipants(request, response){
  response.end();
  logger.logInfo(_className, 'Not implemented the participants yet!');

}

/* METHODS NOT EXPOSED THROUGH THE MODULE */

function _dirtyURLResponse(response) {
  response.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
  response.end(JSON.stringify({error: 'Dirty URL: Only alphanumeric characters are allowed'}));
  logger.logInfo(_className, 'Created a dirty URL response');
}

function _isURLParamsInvalid(param) {
  var pattern = new RegExp(/[^a-z0-9]/gi);
  return pattern.test(param);
}

function _stringifyRespons(shouldBePretty, object){
  if(shouldBePretty === 'true'){
    return JSON.stringify(object, null, 2);
  } else {
    return JSON.stringify(object);
  }
}

function _encodeURLWindows1252(urlToEncode){

}

module.exports = {
  handleRoot: handleRoot,
  handleSchedule: handleSchedule,
  handleExam: handleExam,
  handleParticipants: handleParticipants
};
