//Require various modules
var http = require('http'),
    network = require('network'),
    url = require('url'),
    logger = require('./logger'),
    requestHandler = require('./request-handler');

//Variables to be used in this file
var _port = 8080,
    _className = 'SERVER';

http.createServer(function (req, res) {

  var path = url.parse(req.url, true).pathname;

  switch (path) {
    case '/':
    requestHandler.handleSchedule(req, res);
    logger.logInfo(_className, 'Handle request for schedule data');
    break;
    case '/schedule':
    requestHandler.handleSchedule(req, res);
    logger.logInfo(_className, 'Handle request for schedule data');
    break;
    case '/exam':
    requestHandler.handleExam(req, res);
    logger.logInfo(_className, 'Handle request for exam data');
    break;
    case '/participants':
    requestHandler.handleParticipants(req, res);
    logger.logInfo(_className, 'Handle request for data about participants');
    break;
    case '/favicon.ico':
    requestHandler.handleFaveicon(req, res);
    logger.logInfo(_className, 'Handle request for favicon');
    break;
    default:
    res.end();
    logger.logInfo(_className, 'Handle request for undefined path');
  }

}).listen(_port);

//Log the ip and port that the server is running on
network.get_public_ip(function(error, ip){
  if(!error){
    logger.logInfo(_className, 'Is running on ' + ip + ':' + _port);
  } else{
    logger.logError(_className, 'Could not retrieve ip address');
  }
});
