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
  var studentId = url.parse(request.url, true).query.studentId,

      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

  var paramArray = [];
  paramArray.push(studentId);

  if(!_isNumberOfUrlParamsCorrect(paramArray, 1)){
    _incorrectParamResponse(response);
    return;
  }

  if(!_isUrlParamsValid(paramArray)){
    _dirtyUrlResponse(response);
    return;
  }

  scraper.getSceduleData(studentId)
  .then(function(data){
    var responseObject = builder.createScheduleObject(data);

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(responseObject, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, responseObject));
    }

    logger.logInfo(_className, 'Served information for student: ' + studentId);
  })
  .catch(function(error){
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}


function handleExam(request, response) {
  var studentId = url.parse(request.url, true).query.studentId,
      quarter = url.parse(request.url, true).query.quarter,

      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

  var paramArray = [];
  paramArray.push(studentId);
  paramArray.push(quarter);

  if(!_isNumberOfUrlParamsCorrect(paramArray, 2)){
    _incorrectParamResponse(response);
    return;
  }

  if(!_isUrlParamsValid(paramArray)){
    _dirtyUrlResponse(response);
    return;
  }

  scraper.getExamData(studentId, quarter)
  .then(function(data){
    var responseObject = builder.createExamObject(data);

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(responseObject, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, responseObject));
    }

    logger.logInfo(_className, 'Served information for student: ' + studentId);
  })
  .catch(function(error){
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}


function handleClass(request, response){
  var classId = url.parse(request.url, true).query.classId,
      classGroup = url.parse(request.url, true).query.classGroup,
      group = url.parse(request.url, true).query.group,

      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

  var paramArray = [];
  paramArray.push(classId);
  paramArray.push(classGroup);
  paramArray.push(group);

  if(!_isNumberOfUrlParamsCorrect(paramArray, 3)){
    _incorrectParamResponse(response);
    return;
  }

  if(!_isUrlParamsValid(paramArray)){
    _dirtyUrlResponse(response);
    return;
  }

  scraper.getClassData(classId, classGroup, group)
  .then(function(data){
    var responseObject = builder.createClassObject(data);

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(responseObject, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, responseObject));
    }

    logger.logInfo(_className, 'Served information for class: ' + classId);
  })
  .catch(function(error) {
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}

function handleTest(request, response){
  var test = url.parse(request.url, true).query.data,

      pretty = url.parse(request.url, true).query.pretty,
      callback = url.parse(request.url, true).query.callback;

  var paramArray = [];
  paramArray.push(test);

  if(!_isNumberOfUrlParamsCorrect(paramArray, 1)){
    _incorrectParamResponse(response);
    return;
  }

  if(!_isUrlParamsValid(paramArray)){
    _dirtyUrlResponse(response);
    return;
  }

  builder.createTestObject(test)
  .then(function(data){

    if(callback){
      response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      response.end(_jsonpRespons(data, callback));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      response.end(_stringifyRespons(pretty, data));
    }

    logger.logInfo(_className, 'Served test data');
  })
  .catch(function(error){
    response.writeHead(501, {'Content-Type': 'application/json; charset=utf-8'});
    response.end(JSON.stringify({error: error.message}));
  });
}


/* METHODS NOT EXPOSED THROUGH THE MODULE */
function _dirtyUrlResponse(response) {
  response.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
  response.end(JSON.stringify({info: 'Only alphanumeric characters are allowed in the URL params'}));
  logger.logInfo(_className, 'Created a \'dirty URL\' response');
}

function _incorrectParamResponse(response){
  response.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
  response.end(JSON.stringify({info: 'Incorrect number of URL parameters provided'}));
  logger.logInfo(_className, 'Created a \'not enough params provided\' response');
}

function _isNumberOfUrlParamsCorrect(paramArray, requiredNumber){
  var numberOfParams = 0;
  for (var i = 0; i < paramArray.length; i++) {
    if(paramArray[i]){
      numberOfParams++;
    }
  }
  return numberOfParams === requiredNumber;
}

function _isUrlParamsValid(paramArray) {
  var pattern = new RegExp(/[^a-z0-9æøå\s]/ig);
  for (var i = 0; i < paramArray.length; i++) {
    if(pattern.test(paramArray[i])){
      return false;
    }
  }
  return true;
}

function _stringifyRespons(shouldBePretty, object){
  return (shouldBePretty === 'true') ? JSON.stringify(object, null, 2) : JSON.stringify(object);
}

function _jsonpRespons(data, callbackName){
  return (callbackName + '(' + JSON.stringify(data) + ')');
}

module.exports = {
  handleRoot: handleRoot,
  handleUndefined: handleUndefined,
  handleSchedule: handleSchedule,
  handleExam: handleExam,
  handleClass: handleClass,
  handleTest: handleTest
};
