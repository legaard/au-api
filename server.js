//Require moduls
var request = require('request');
var http = require('http');
var url = require('url');
var htmlparser = require('htmlparser2');

var port = 8080;
var aarskort;
var auCookie = "";

//Create a server
http.createServer(function (req, res) {

  //Get url param: aarskort
  aarskort = url.parse(req.url, true).query.aarskort;

  if(aarskort === undefined){
    res.writeHead(500, {'Content-Type' : 'text/plain'});
    res.end('Missing url param: aarskort');
  }

  //Fake data
  if(aarskort === 'test'){
    res.writeHead(200, {'Content-Type' : 'application/json'});
    res.end(JSON.stringify({
      studentId : 201205397,
      studentName: 'Lasse Legaard',
      courses : [
        {
          course: 'Pervasive Positioning',
          day: 'Mandag',
          time: '11 - 12',
          week: '35-41',
          place: '5794-118 (Åbogade 40)'
        },
        {
          course: 'Pervasive Positioning',
          day: 'Onsdag',
          time: '9 - 11',
          week: '36',
          place: 'Lokale: bygning 1584, lokale 124 (Langelandsgade 139)'
        },
        {
          course: 'Pervasive Positioning',
          day: 'Onsdag',
          time: '9 - 11',
          week: '35, 37-41',
          place: '5794-118 (Åbogade 40)'
        },
        {
          course: 'Interaktive Rum',
          day: 'Onsdag',
          time: '9 - 15',
          week: '35, 45-51',
          place: 'ny192 (5335-192)'
        },
        {
          course: 'Kontekst bevidsthed',
          day: 'Mandag',
          time: '11 - 12',
          week: '45-51',
          place: '5794-118 (Åbogade 40)'
        },
        {
          course: 'Kontekst bevidsthed',
          day: 'Tirsdag',
          time: '14 - 16',
          week: '45-51',
          place: 'Store Aud., IT-huset (5510-103)'
        },
        {
          course: 'Anvanceret Web Programmering',
          day: 'Mandag',
          time: '14 - 17',
          week: '45-51',
          place: 'Store Aud., IT-huset (5510-103)'
        },
        {
          course: 'Cloud Computing and Architecture',
          day: 'Mandag',
          time: '14 - 17',
          week: '40',
          place: 'Auditorium I (1514-213)'
        },
        {
          course: 'Cloud Computing and Architecture',
          day: 'Mandag',
          time: '14 - 17',
          week: '35-39, 41',
          place: 'Store Aud., IT-huset (5510-103)'
        },
        {
          course: 'Shape Changing Interfaces',
          day: 'Tirsdag',
          time: '9 - 15',
          week: '35-41',
          place: 'Stibitz-123, Åbogade'
        }
      ]
    }));
  }

  getData(function(error, result){
    if(error){
      res.writeHead(500, {'Content-Type' : 'text/plain'});
      res.end('Things did not work out!');
      console.log('Something went wrong!');
    } else {
      res.writeHead(200, {'Content-Type' : 'application/json'});
      var responseObject = getScheduleObjectFromString(result);
      res.end(responseObject);
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
  jsonToReturn.courses = [];

  //Get body for html
  var body = htmlparser.parseDOM(string)[2].children[3].children;

  for (var i = 0; i < body.length; i++) {
    var courseName = "";
    var week = "";


    //Retrive the name of the student
    if(body[i].name === 'h2'){
      var data = body[i].children;
      for (var j = 0; j < data.length; j++) {
        if(data[j].type == 'text'){
          jsonToReturn.student = data[j].data.split("for")[1].trim();
        }
      }
    }

    //Retrieve the course titles
    if(body[i].name === 'h3'){
      jsonToReturn.courses.push(body[i].children[0].data);
    }

    //Retrieve individual courses
    if(body[i].name === 'table'){
      var tableRows = body[i].children[0];

      for (var k = 0; k < tableRows.length; k++) {
        if (tableRows[k].name === 'tr') {
          console.log('hurraaaa!');
        }
      }
    }

  }
  return JSON.stringify(jsonToReturn);
};

//Update cookie once and then every 10 minutes
updateCookie();
setInterval(updateCookie, 600000);
