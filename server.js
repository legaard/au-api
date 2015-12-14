//Require various modules
var request = require('request'),
http = require('http'),
url = require('url'),
htmlparser = require('htmlparser2'),
fs = require('fs');

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
    var data = builder.getTestObject(function(data){
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
      res.end(JSON.stringify(builder.createJSONObjectFromHTML(result)));
    }
  });

}).listen(port);

/********** MODULES **********/

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
  request.post(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      auCookie = response.headers['set-cookie'][0].split(';')[0];
      console.log('Updated cookie');
    } else {
      console.log('Could not retrieve cookie');
    }
  });
};

// Builder module
var builder = (function () {

  var res = {};
  res.courses = [];
  var studentName = '';

  return{
    init: function(studentId){
      res.studentId = studentId;
    },

    getStudentId: function(){
      return res.studentId;
    },

    createJSONObjectFromHTML: function (htmlString) {

      //Get body for html
      var body = htmlparser.parseDOM(htmlString)[2].children[3].children;

      for (var i = 0; i < body.length; i++) {
        var courseName = '';

        //Retrive the name of the student
        if(body[i].name === 'h2'){
          studentName = body[i].children[0].data.split('for')[1].trim();
        }

        //Retrieve the course title
        if(body[i].name === 'h3'){
          this.courseName = body[i].children[0].data;
        }

        //Retrieve individual course data
        if(body[i].name === 'table'){
          var tableRow = body[i].children;

          for (var k = 0; k < tableRow.length; k++) {
            var course = {};
            if (tableRow[k].name === 'tr') {
              course.courseName = this.courseName;
              course.link = tableRow[k].children[0].children[0].attribs ? 'http://services.science.au.dk/apps/skema/' + tableRow[k].children[0].children[0].attribs.href : '';
              course.day = tableRow[k].children[1].children[0] ? tableRow[k].children[1].children[0].data : '';
              course.time = tableRow[k].children[2].children[0] ? tableRow[k].children[2].children[0].data.replace(/\s/g, '').trim() : '';
              course.week = tableRow[k].children[4].children[0] ? tableRow[k].children[4].children[0].data.replace(/uge/g, '').trim() : '';
              course.location = tableRow[k].children[5].children[0] ? tableRow[k].children[5].children[0].children[0].data : '';
            }
            //Pushing course to courses
            if(JSON.stringify(course) !== '{}'){
              res.courses.push(course);
            }
          }
        }

        //Adding student name
        if(studentName !== ''){
          res.studentName = studentName;
        }
      }
      return res;
    },

    getTestObject: function (callback){
      fs.readFile("./201205397.json", "utf8", function(error, data){
        if(error){
          console.log('An error occured while reading the test file');
        } else {
          callback(data);
        }
      });
    }
  };

})();

//Update cookie once and then every 10 minutes
updateCookie();
setInterval(updateCookie, 600000);
