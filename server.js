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
    requestHandler.handleRoot(req, res);
    logger.logInfo(_className, 'Handled request for the root');
    break;
    case '/schedule':
    requestHandler.handleSchedule(req, res);
    logger.logInfo(_className, 'Handled request for schedule data');
    break;
    case '/exam':
    requestHandler.handleExam(req, res);
    logger.logInfo(_className, 'Handled request for exam data');
    break;
    case '/participants':
    requestHandler.handleParticipants(req, res);
    logger.logInfo(_className, 'Handled request for data about participants');
    break;
    default:
    res.end();
    logger.logInfo(_className, 'Handled request for undefined path: ' + path);
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
