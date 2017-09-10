const cheerio = require('cheerio');
const url = require('url');

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
    return undefined;
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
      course.type = removeEndingOnCourseType(type);
      course.day = $td.eq(1).text();
      course.time = $td.eq(2).text().replace(/\s/g, '').trim();
      course.location = {};
      course.location.information = $td.eq(3).text().trim();
      course.location.link = $td.eq(3).children().eq(0).attr('href');
      course.weeks = $td.eq(4).text().replace(/uge/g, '').trim();
      course.class = URLToClassObject($td.eq(0).children().eq(0).attr('href'));
      course.note = $td.eq(5).children().eq(0).text().trim();

      //Adding the newly created course object to the array of courses in the respose object
      build.courses.push(course);
    }
  });

  return build;
}

function removeEndingOnCourseType(type) {
  var trimmedType = '';

  switch (type) {
    case 'Forelæsninger':
      trimmedType = 'Forelæsning';
      break;
    case 'Teoretiske øvelser':
      trimmedType = 'Teoretisk øvelse';
      break;
    case 'Laboratorieøvelser':
      trimmedType = 'Laboratorieøvelse';
      break;
    case 'Øvelser':
      trimmedType = 'Øvelse';
      break;
    default:
    trimmedType = type;
  }

  return trimmedType;
}

function URLToClassObject(urlToTransform){
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
  createTestObject: createTestObject
};
