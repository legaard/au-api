var cheerio = require('cheerio'),
    fs = require('fs'),
    url = require('url'),
    logger = require('./logger');

var _className = 'BUILDER';

// 'http://services.science.au.dk/apps/skema/holdliste.asp?udbud=5298507&holdgruppe_da=F&hold=F'

function createScheduleObject(htmlString) {

  //Creating the build object
  var build = {};
  var $ = cheerio.load(htmlString);
  var $body = $('body ');

  //Retrieving the student name (if it exist)
  build.studentName = $('h2', $body).text().indexOf('for') > -1 ? $('h2', $body).text().split('for')[1].trim() : '';

  //Creating an array of courses
  build.courses = [];

  //Looping over the tables
  $('table', $body).each(function (i, element) {

    var courseName = $(this).prevAll('h3').first().text();
    var type = $(this).prevAll('strong').first().text();
    var tr = $(this).children();

    //Looping over the tablerows
    for (var k = 0; k < tr.length; k++) {
      var course = {};

      //Adding properties to the course object
      course.courseName = courseName;
      course.type = _removeEndingOnCourseType(type);
      course.class = _transformURLToObject($('td', $(tr[k])).eq(0).children().eq(0).attr('href'));
      course.day = $('td', $(tr[k])).eq(1).text().toLowerCase();
      course.time = $('td', $(tr[k])).eq(2).text().replace(/\s/g, '').trim();
      course.location = $('td', $(tr[k])).eq(3).text().trim();
      course.week = $('td', $(tr[k])).eq(4).text().replace(/uge/g, '').trim();
      course.note = $('td', $(tr[k])).eq(5).children().eq(0).text().trim();

      //Adding the newly created course object to the array of courses in the respose object
      build.courses.push(course);
    }
  });

  //Return an error if no student has the student number
  if(build.studentName === ''){
    logger.logInfo(_className, 'No student match. Error object created');
    return {error: 'No student matching that student number'};
  }

  logger.logInfo(_className, 'Created response object');
  return build;

  /*var responseObject = {};
  responseObject.studentName = '';
  responseObject.courses = [];

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
      this.type = _removeEndingOnCourseType(body[i].children[0].data);
    }

    //Retrieve data for the individual course
    if(body[i].name === 'table'){
      var tableRow = body[i].children;

      for (var k = 0; k < tableRow.length; k++) {
        var course = {};

        if (tableRow[k].name === 'tr') {
          course.courseName = this.courseName;
          course.type = this.type;
          course.class = tableRow[k].children[0].children[0].attribs ?  _transformURLToObject(tableRow[k].children[0].children[0].attribs.href) : 'unknown';
          course.day = tableRow[k].children[1].children[0] ? tableRow[k].children[1].children[0].data.toLowerCase() : 'unknown';
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
    logger.logInfo(_className, 'No student match. Error object created');
    return {error: 'No student matching that student number'};
  }

  logger.logInfo(_className, 'Created response object');
  return responseObject;*/
}

/* HELPER METHODS RELATED TO THE SCHEDULE */

function createTestScheduleObject(fileName, callback){
  fs.readFile('./' + fileName, 'utf8', function(error, data){
    if(!error){
      logger.logInfo(_className, 'Successfully read the file for the test object');
      callback(null, data);
    } else {
      callback(error);
      logger.logError(_className, 'An error occured while reading the test file');
    }
  });
}

function _removeEndingOnCourseType(type) {
  var trimmedType = '';

  switch (type) {
    case 'Forelæsninger':
    trimmedType = 'forelæsning';
    break;
    case 'Teoretiske øvelser':
    trimmedType = 'teoretisk øvelse';
    break;
    case 'Laboratorieøvelser':
    trimmedType = 'laboratorieøvelse';
    break;
    case 'Øvelser':
    trimmedType = 'øvelse';
    break;
    default:
    trimmedType = type;
  }
  return trimmedType;
}

function _transformURLToObject(urlToTransform){
  var obj = {};
  var query = url.parse(urlToTransform, true).query;

  obj.classId = query.udbud;
  obj.classGroup = query.holdgruppe_da;
  obj.group = query.hold;

  return obj;
}

module.exports = {
  createScheduleObject: createScheduleObject,
  createTestScheduleObject: createTestScheduleObject
};
