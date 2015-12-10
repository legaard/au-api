//Require moduls
var request = require('request');
var http = require('http');
var url = require('url');
var htmlparser = require('htmlparser2');

var port = 8080;
var aarskort;
var auCookie;

//Create a server
http.createServer(function (req, res) {

  //Get url param: aarskort
  aarskort = url.parse(req.url, true).query.aarskort;

  if(aarskort === undefined){
    res.writeHead(500, {'Content-Type' : 'text/plain'});
    res.end('Missing url param: aarskort');
  }

  getData(function(error, result){
    if(error){
      res.writeHead(500, {'Content-Type' : 'text/plain'});
      res.end('Things did not work out!');
      console.log('Something went wrong!');
    } else {
      res.writeHead(200, {'Content-Type' : 'application/json'});
      var scheduleObject = getScheduleObjectFromString(result);
      res.end(scheduleObject);
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

  request.post({url: url, jar: j, form: {'B1' : 'S%F8g', 'aarskort' : aarskort}}, function (error, response, body) {
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
  request.post(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      auCookie = response.headers['set-cookie'][0].split(';')[0];
      console.log('Updated cookie');
    } else {
      console.log('Could not retrieve cookie');
    }
  });
};

//Method to transform html to json
var getScheduleObjectFromString = function (string){

  var jsonToReturn = {};
  //Get body for html
  var body = htmlparser.parseDOM(string)[2].children[3].children;

  for (var i = 0; i < body.length; i++) {

    //Retrive the name of the student
    if(body[i].name === 'h2'){
      var data = body[i].children;
      for (var j = 0; j < data.length; j++) {
        if(data[j].type == 'text'){
          jsonToReturn.student = data[j].data.split("for")[1].trim();
        }
      }

    }
  }
  console.log(jsonToReturn);
  return JSON.stringify(jsonToReturn);
};

//Update cookie once and then every 10 minutes
updateCookie();
setInterval(updateCookie, 600000);
