var cheerio = require('cheerio'),
    fs = require('fs'),
    Q = require('q'),
    url = require('url'),
    logger = require('./logger');

var _className = 'BUILDER';

function createScheduleObject(htmlString) {

  //Creating the cheerio and build object
  var build = {};
  var $ = cheerio.load(htmlString);
  var $body = $('body');

  //Retrieving the student name (if it exist)
  var studentName = $('h2', $body).text();
  build.studentName = studentName.indexOf('for') > -1 ? studentName.split('for')[1].trim() : null;

  //Return an error if no student has the studentID
  if(!build.studentName){
    logger.logInfo(_className, 'No student match. Error object created');
    return {info: 'No student matching the studentID provided'};
  }

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
      course.location = {};
      course.location.information = $td.eq(3).text().trim();
      course.location.link = $td.eq(3).children().eq(0).attr('href');
      course.week = $td.eq(4).text().replace(/uge/g, '').trim();
      course.class = _URLToClassObject($td.eq(0).children().eq(0).attr('href'));
      course.note = $td.eq(5).children().eq(0).text().trim();

      //Adding the newly created course object to the array of courses in the respose object
      build.courses.push(course);
    }
  });

  logger.logInfo(_className, 'Created schedule object');
  return build;
}

function createExamObject(htmlString){

  //Creating the cheerio and build object
  var build = {};
  var $ = cheerio.load(htmlString);
  var $body = $('body');

  //Retrieving the student name (if it exists)
  var studentName = $('h2', $body).text();
  build.studentName =  studentName.indexOf('for') > -1 ? studentName.split('for')[1].trim() : null;

  //Return an error if no student match the id provided
  if(!build.studentName){
    logger.logInfo(_className, 'No student match. Error object created');
    return {info: 'No student matching the studentID provided'};
  }

  //Creating an array for the exams
  build.exams = [];

  //Iterating over the tables
  $('table', $body).each(function(i, element){
    var examName = $(this).prevAll('h3').first().text();
    var type = $(this).prevAll('strong').first().text();
    var tr = $(this).children();

    //Looping over the table rows
    for (var k = 0; k < tr.length; k++){
      var exam = {};
      var $td = $('td', tr[k]);

      //Adding properties to the exam object
      exam.examName = examName;
      exam.type = type.toLowerCase();
      exam.date = $td.eq(1).text().trim();
      exam.time = $td.eq(2).text().replace(/\s/g, '').trim();
      exam.location = {};
      exam.location.information = $td.eq(3).text().trim();
      exam.location.link = $td.eq(3).children().eq(0).attr('href');
      exam.class = _URLToClassObject($td.eq(0).children().eq(0).attr('href'));
      exam.note = $td.eq(5).children().eq(0).text().trim();

      //Adding the exam object to the response objects array
      build.exams.push(exam);
    }
  });

  logger.logInfo(_className, 'Created exam object');
  return build;
}

function createClassObject(htmlString){
  //Creating the cheerio and build object
  var build = {};
  var $ = cheerio.load(htmlString);
  var $body = $('body');

  var courseName = $('h2', $body).eq(0).text().trim();
  var numberOfStudents = $('h2', $body).eq(1).text();
  var tempArray = numberOfStudents.split(' ');

  build.numberOfStudents = numberOfStudents.indexOf('ingen studerende') > -1 ? null : parseInt(tempArray[tempArray.length - 2].substring(1), 10);
  build.courseName = courseName;
  build.students = [];

  if (!build.numberOfStudents) {
    logger.logInfo(_className, 'No class match. Error object created');
    return {info: 'No class matching the provided data'};
  }

  $('tr', $body).each(function(i, element){
    build.students.push($('td', this).eq(1).text().trim());
  });

  logger.logInfo(_className, 'Created class object');
  return build;
}

function createIndexResponse(){
  var deferred = Q.defer();

  fs.readFile('./index.html', 'utf8', function(error, data){
    if(!error){
      logger.logInfo(_className, 'Read the index.html file');
      deferred.resolve(data);
    } else {
      logger.logError(_className, 'An error occured while reading the index.html file');
      deferred.reject(error);
    }
  });

  return deferred.promise;
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

function _URLToClassObject(urlToTransform){
  var obj = {};
  var query = url.parse(urlToTransform, true).query;

  obj.classId = query.udbud;
  obj.classGroup = query.holdgruppe_da;
  obj.group = query.hold;

  return obj;
}

module.exports = {
  createScheduleObject: createScheduleObject,
  createExamObject: createExamObject,
  createClassObject: createClassObject,
  createIndexResponse: createIndexResponse
};
