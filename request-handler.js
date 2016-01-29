var url = require('url'),
    builder = require('./builder'),
    scraper = require('./scraper'),
    logger = require('./logger');

var _className = 'HANDLER';

function handleRoot(request, response){
  var res = builder.createIndexResponse()
  .then(function(data){
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    response.end(data);
  })
  .catch(function(){
    response.writeHead(404, {'Content-Type': 'text/plan; charset=utf-8'});
    response.end('404: Could not find \'index.html\'');
  });
}


function handleUndefined(request, response){
  response.writeHead(403, {'Content-Type': 'text/plan; charset=utf-8'});
  response.end('403: Refuse to fulfill request');
}


function handleSchedule(request, response){
  var studentID = url.parse(request.url, true).query.studentID,
      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

  if(_isURLParamsInvalid(studentID) || _isURLParamsInvalid(callback)){
    _dirtyURLResponse(response);
    return;
  }

  scraper.getSceduleData(studentID)
  .then(function(data){
    var responseObject = builder.createScheduleObject(data);

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(responseObject, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, responseObject));
    }

    logger.logInfo(_className, 'Served information for student: ' + studentID);
  })
  .catch(function(error){
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}


function handleExam(request, response) {
  var studentID = url.parse(request.url, true).query.studentID,
      quarter = url.parse(request.url, true).query.quarter,
      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

  if(_isURLParamsInvalid(studentID) || _isURLParamsInvalid(quarter) || _isURLParamsInvalid(callback)){
    _dirtyURLResponse(response);
    return;
  }

  scraper.getExamData(studentID, quarter)
  .then(function(data){
    var responseObject = builder.createExamObject(data);

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(responseObject, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, responseObject));
    }

    logger.logInfo(_className, 'Served information for student: ' + studentID);
  })
  .catch(function(error){
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}


function handleClass(request, response){
  var classID = url.parse(request.url, true).query.classID,
      classGroup = url.parse(request.url, true).query.classGroup,
      group = url.parse(request.url, true).query.group,
      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

 if(_isURLParamsInvalid(classID) || _isURLParamsInvalid(classGroup) || _isURLParamsInvalid(group) || _isURLParamsInvalid(callback)){
    _dirtyURLResponse(response);
    return;
  }

  scraper.getClassData(classID, classGroup, group)
  .then(function(data){
    var responseObject = builder.createClassObject(data);

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(responseObject, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, responseObject));
    }

    logger.logInfo(_className, 'Served information for class: ' + classID);
  })
  .catch(function(error) {
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}


/* METHODS NOT EXPOSED THROUGH THE MODULE */
function _dirtyURLResponse(response) {
  response.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
  response.end(JSON.stringify({error: 'Only alphanumeric characters are allowed in the URL params'}));
  logger.logInfo(_className, 'Created a dirty URL response');
}

function _isURLParamsInvalid(param) {
  var pattern = new RegExp(/[^a-z0-9æøå]/ig);
  return pattern.test(param);
}

function _stringifyRespons(shouldBePretty, object){
  if(shouldBePretty === 'true'){
    return JSON.stringify(object, null, 2);
  } else {
    return JSON.stringify(object);
  }
}

function _jsonpRespons(data, callbackName){
  return (callbackName + '(' + JSON.stringify(data) + ')');
}

module.exports = {
  handleRoot: handleRoot,
  handleUndefined: handleUndefined,
  handleSchedule: handleSchedule,
  handleExam: handleExam,
  handleClass: handleClass
};
