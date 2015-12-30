//Require various modules
var http = require('http'),
url = require('url'),
sanitizer = require('sanitize-html'),
builder = require('./builder'),
scraper = require('./scraper'),
dbhandler = require('./dbhandler');

//Variables to be used
var port = 8080;

//Create a server
http.createServer(function (req, res) {

  //Get url params 'studentNumber', 'pretty' and 'newest'
  studentNumber = sanitizer(url.parse(req.url, true).query.aarskort);
  pretty = sanitizer(url.parse(req.url, true).query.pretty);
  newest = sanitizer(url.parse(req.url, true).query.newest);

  //Return an error if no 'studentNumber' is provided
  if(studentNumber === undefined || studentNumber === ''){
    res.writeHead(501, {'Content-Type' : 'text/plain'});
    res.end('Server: The URL param \'studentNumber\' is missing or empty');
  }

  //Respond with a fake data object
  if(studentNumber === 'test'){
    res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
    var data = builder.createTestResponseObject('201205397.json', function(data){
      res.end(data);
    });
  }

  scraper.getSceduleData(studentNumber, function(error, data){
    if(error){
      res.writeHead(501, {'Content-Type' : 'text/plain'});
      res.end('Server: An error occured while scraping the AU website!');
    } else {
      res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
      res.end(JSON.stringify(builder.createResponseObject(data)));
    }
  });

}).listen(port);

//Update cookie once and then every 10 minutes
scraper.updateCookie();
setInterval(scraper.updateCookie, 600000);
