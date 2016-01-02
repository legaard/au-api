//Require various modules
var http = require('http'),
url = require('url'),
network = require('network'),
builder = require('./builder'),
scraper = require('./scraper'),
util = require('./util');

//Variables to be used in this file
var _port = 8080,
_className = 'SERVER';

http.createServer(function (req, res) {

  //Get URL params 'studentNumber', 'pretty' and 'db'
  var studentNumber = url.parse(req.url, true).query.aarskort;
  var pretty = url.parse(req.url, true).query.pretty;
  var db = url.parse(req.url, true).query.db;

  //Handle the request for the faveicon
  if(req.url === '/favicon.ico'){
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    util.logStatement(_className, 'Handlet the request for faveicon');
    return;
  }

  //Return an error if no 'studentNumber' is provided
  if(studentNumber === undefined || studentNumber === ''){
    res.writeHead(501, {'Content-Type' : 'text/plain'});
    res.end(_className + ': The URL param \'studentNumber\' is empty or missing');
  }

  //Respond with a test object
  if(studentNumber === 'test'){
    res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
    builder.createTestResponseObject('201205397.json', function(data){
      res.end(data);
      util.logStatement(_className, 'Served information. Student: ' + studentNumber);
    });
  }

  scraper.getSceduleData(studentNumber, function(error, data){
    if(error){
      res.writeHead(501, {'Content-Type' : 'text/plain'});
      res.end(_className + ': An error occured while scraping the AU website');
    } else {
      res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
      responseObject = builder.createResponseObject(data);
      response = _stringifyRespons(pretty, responseObject);
      res.end(response);
      util.logStatement(_className, 'Served information. Student: ' + studentNumber);
    }
  });

}).listen(_port);

//Log the ip and port which the server is running on
network.get_public_ip(function(error, ip){
    if(!error){
      util.logStatement(_className, 'Is running on ' + ip + ':' + _port);
    }
});

//Update cookie once and then every 10 minutes
scraper.updateCookie();
setInterval(scraper.updateCookie, 600000);

function _isURLParamValid(param) {
  //Is the param !== '', null, undefined etc.
  //Some regEx to decide if the string is valid or not.
}

function _stringifyRespons(shouldBePretty, object){
  if(shouldBePretty === 'true'){
    return JSON.stringify(object, null, 2);
  } else {
    return JSON.stringify(object);
  }
}
