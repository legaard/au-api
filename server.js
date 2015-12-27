//Require various modules
var request = require('request'),
http = require('http'),
url = require('url'),
htmlparser = require('htmlparser2'),
fs = require('fs');
Builder = require('./builder.js');

var port = 8080;
var aarskort;
var auCookie = "";

//Create a server
http.createServer(function (req, res) {

  //Get url param: aarskort
  aarskort = url.parse(req.url, true).query.aarskort;

  //Return an error if not 'aarkort' is provided
  if(aarskort === undefined){
    res.writeHead(501, {'Content-Type' : 'text/plain'});
    res.end('Missing url param: aarskort');
  }

  //Respond with a fake data object
  if(aarskort === 'test'){
    res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
    var data = Builder.getTestObject(function(data){
      res.end(data);
    });
  }

  getData(function(error, result){
    if(error){
      res.writeHead(501, {'Content-Type' : 'text/plain'});
      res.end('Things did not work out!');
      console.log('Something went wrong!');
    } else {
      res.writeHead(200, {'Content-Type' : 'application/json; charset=utf-8'});
      res.end(JSON.stringify(Builder.createJSONObjectFromHTML(result)));
    }
  });

}).listen(port);

//Request the schedule service at AU
var getData = function(callback){

  //Creating a cookie and the url to use
  var j = request.jar();
  var cookie = request.cookie(auCookie);
  var url = 'http://services.science.au.dk/apps/skema/ElevSkema.asp';
  j.setCookie(cookie, url);

  var options = {
    url: url,
    jar: j,
    form: {'B1' : 'S%F8g', 'aarskort' : aarskort},
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Language': 'da-DK,da;q=0.8,en-US;q=0.6,en;q=0.4'
    }
  };

  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, body);
    } else {
      callback(error);
    }
  });
};

//Function used to update the cookie
var updateCookie = function(){
  var url = 'http://services.science.au.dk/apps/skema/VaelgElevskema.asp?webnavn=skema';
  request.post(url, function (error, response) {
    if (!error && response.statusCode == 200) {
      auCookie = response.headers['set-cookie'][0].split(';')[0];
      console.log('Updated cookie');
    } else {
      console.log('Could not retrieve cookie');
    }
  });
};

//Update cookie once and then every 10 minutes
updateCookie();
setInterval(updateCookie, 600000);
