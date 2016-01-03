var url = require('url'),
builder = require('./builder'),
scraper = require('./scraper'),
util = require('./util');

var _className = 'HANDLER';

/* METHODS AVAILBLE THROUGH THE MODULE */

function handleFaveicon(request, response){
  response.writeHead(200, {'Content-Type': 'image/x-icon'});
  response.end();
}

function handleSchedule(request, response){
  var studentNumber = url.parse(request.url, true).query.aarskort;
  var pretty = url.parse(request.url, true).query.pretty;

  if(_isURLParamsInvalid(studentNumber)){
    _dirtyURLResponse(response);
    return;
  }

  if(studentNumber === 'test'){

    builder.createTestScheduleObject('201205397.json', function(error, data){
      if(error){
        response.writeHead(501, {'Content-Type' : 'text/plain'});
        response.end(_className + ': Could not create test object');
      } else {
        response.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
        response.end(data);
      }
    });

  } else {

    scraper.getSceduleData(studentNumber, function(error, data){
      if(error){
        response.writeHead(501, {'Content-Type': 'text/plain'});
        response.end(_className + ': An error occured while scraping the AU website');
      } else {
        response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        responseObject = builder.createScheduleObject(data);
        res = _stringifyRespons(pretty, responseObject);
        response.end(res);
        util.logInfo(_className, 'Served information. Student: ' + studentNumber);
      }
    });
  }

}

function handleExam(request, response) {
  response.end();
  util.logInfo(_className, 'Not implemented the exam yet!');
}

function handleParticipants(request, response){
  response.end();
  util.logInfo(_className, 'Not implemented the participants yet!');

}

/* METHODS NOT EXPOSED THROUGH THE MODULE */

function _dirtyURLResponse(response) {
  response.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
  response.end(JSON.stringify({error: 'Dirty URL: Only alphanumeric characters are allowed'}));
  util.logInfo(_className, 'Created a dirty URL response');
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

//Update cookie once and then every 10 minutes
scraper.updateCookie();
setInterval(scraper.updateCookie, 600000);

module.exports = {
  handleFaveicon: handleFaveicon,
  handleSchedule: handleSchedule,
  handleExam: handleExam,
  handleParticipants: handleParticipants
};
