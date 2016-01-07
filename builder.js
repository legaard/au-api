var cheerio = require('cheerio'),
    fs = require('fs'),
    url = require('url'),
    logger = require('./logger');

var _className = 'BUILDER';

// 'http://services.science.au.dk/apps/skema/holdliste.asp?udbud=5298507&holdgruppe_da=F&hold=F'

function createScheduleObject(htmlString) {

  //Creating the cheerio and build object
  var build = {};
  var $ = cheerio.load(htmlString);
  var $body = $('body');

  //Retrieving the student name (if it exist)
  var h2 = $('h2', $body).text();
  build.studentName = h2.indexOf('for') > -1 ? h2.split('for')[1].trim() : '';

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
      var $td = $('td', tr[k]);

      //Adding properties to the course object
      course.courseName = courseName;
      course.type = _removeEndingOnCourseType(type);
      course.day = $td.eq(1).text().toLowerCase();
      course.time = $td.eq(2).text().replace(/\s/g, '').trim();
      course.location = $td.eq(3).text().trim();
      course.week = $td.eq(4).text().replace(/uge/g, '').trim();
      course.class = _transformURLToObject($td.eq(0).children().eq(0).attr('href'));
      course.note = $td.eq(5).children().eq(0).text().trim();

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
}

function createExamObject(htmlString){
  //TODO: build exam object
}

function createClassObject(htmlString){
  //TODO: build class object
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
