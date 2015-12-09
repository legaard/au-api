//Require moduls
var request = require('request');
var http = require('http');
var url = require('url');

var port = 8080;
var aarskort;

//Create a server
http.createServer(function (req, res) {

  aarskort = url.parse(req.url, true).query.aarskort;

  if(aarskort === undefined){
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end("No 'aarskort' supplied");
  }

  getData(function(error, result){
    if(error){
      res.writeHead(500, {'Content-Type' : 'text/plain'});
      console.log("Something went wrong!");
      res.end("Things did not work out!");
    } else {
      res.writeHead(200, {'Content-Type' : 'text/plain'});
      res.end(result);
    }
  });

}).listen(port);

//Request the service at AU
var getData = function(callback){
  var j = request.jar();
  var cookie = request.cookie('ASPSESSIONIDCQBCCDBC=HHHMMCNDODADCJHKPPPAMJGA');
  var url = 'http://services.science.au.dk/apps/skema/ElevSkema.asp';
  j.setCookie(cookie, url);

  request.post({url: url, jar: j, form: {"B1": "S%F8g", "aarskort" : aarskort}}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, body);
    } else {
      callback(error);
    }
  });

};
