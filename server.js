//Require various modules
var http = require('http'),
url = require('url'),
sanitizer = require('sanitize-html'),
builder = require('./builder'),
scraper = require('./scraper');

//Variables to be used in this file
var _port = 8080,
_className = 'SERVER';

http.createServer(function (req, res) {

  //Get url params 'studentNumber', 'pretty' and 'newest'
  studentNumber = sanitizer(url.parse(req.url, true).query.aarskort);
  pretty = sanitizer(url.parse(req.url, true).query.pretty);
  newest = sanitizer(url.parse(req.url, true).query.newest);

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
    });
  }

  scraper.getSceduleData(studentNumber, function(error, data){
    if(error){
      res.writeHead(501, {'Content-Type' : 'text/plain'});
      res.end(_className + ': An error occured while scraping the AU website');
    } else {
      res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
      responseObject = builder.createResponseObject(data);
      response = pretty === 'true' ? JSON.stringify(responseObject, null, 2) : JSON.stringify(responseObject);
      res.end(response);
    }
  });

}).listen(_port);

//Update cookie once and then every 10 minutes
scraper.updateCookie();
setInterval(scraper.updateCookie, 600000);
