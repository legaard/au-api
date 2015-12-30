var htmlparser = require('htmlparser2'),
fs = require('fs');

var _className = 'BUILDER';

function createResponseObject(htmlString) {
  var responseObject = {};
  responseObject.studentName = '';
  responseObject.courses = [];

  if (htmlString === undefined || htmlString === '') {
    console.log(_className + ': Could not create response object. htmlString was \'undefined\' or empty');
    return;
  }

  //Get body for html
  var body = htmlparser.parseDOM(htmlString)[2].children[3].children;

  for (var i = 0; i < body.length; i++) {
    var courseName = '';
    var type = '';

    //Retrive the name of the student
    if(body[i].name === 'h2'){
      responseObject.studentName = body[i].children[0].data.split('for')[1].trim();
    }

    //Retrieve the course title
    if(body[i].name === 'h3'){
      this.courseName = body[i].children[0].data;
    }

    //Retrieve the type of course
    if(body[i].name === 'strong'){
      this.type = body[i].children[0].data;
    }

    //Retrieve data for the individual course
    if(body[i].name === 'table'){
      var tableRow = body[i].children;

      for (var k = 0; k < tableRow.length; k++) {
        var course = {};

        if (tableRow[k].name === 'tr') {
          course.courseName = this.courseName;
          course.type = this.type;
          course.link = tableRow[k].children[0].children[0].attribs ? 'http://services.science.au.dk/apps/skema/' + tableRow[k].children[0].children[0].attribs.href : 'unknown';
          course.day = tableRow[k].children[1].children[0] ? tableRow[k].children[1].children[0].data : 'unknown';
          course.time = tableRow[k].children[2].children[0] ? tableRow[k].children[2].children[0].data.replace(/\s/g, '').trim() : 'unknown';
          course.week = tableRow[k].children[4].children[0] ? tableRow[k].children[4].children[0].data.replace(/uge/g, '').trim() : 'unknown';
          course.location = tableRow[k].children[5].children[0] ? tableRow[k].children[5].children[0].children[0].data : 'unknown';
        }
        //Pushing course to courses
        if(JSON.stringify(course) !== '{}'){
          responseObject.courses.push(course);
        }
      }
    }
  }

  //Return an error if the student does not exist
  if(responseObject.studentName === ''){
    return {error: 'no student matching that student number'};
  }

  return responseObject;
}

function createTestResponseObject(fileName, callback){
  fs.readFile('./' + fileName, 'utf8', function(error, data){
    if(error){
      console.log(_className + ': An error occured while reading the test file');
    } else {
      callback(data);
    }
  });
}

module.exports = {
  createResponseObject: createResponseObject,
  createTestResponseObject: createTestResponseObject
};
