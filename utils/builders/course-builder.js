const cheerio = require('cheerio');

const helperFunctions = require('./helper-functions');

function createCoursesObject(htmlString) {
  //Creating the cheerio and build object
  let build = {};
  const $ = cheerio.load(htmlString);
  const $body = $('body');

  //Retrieving the student name (if it exist)
  const studentName = $('h2', $body).text();
  build.studentName = studentName.indexOf('for') > -1 ? studentName.split('for')[1].trim() : undefined;

  //Throw an error if no student has the studentID
  if(!build.studentName) throw new Error('No courses found for student');

  //Creating an array of courses
  build.courses = [];

  //Looping over the tables
  $('table', $body).each(function (index, element) {
    const courseName = $(this).prevAll('h3').first().text();
    const type = $(this).prevAll('strong').first().text();
    const $tr = $(this).children();

    //Looping over the tablerows    
    $tr.each(function (index, element) {
      var course = {};
      var $td = $('td', element);

      //Adding properties to the course object
      course.courseName = courseName;
      course.type = removeEndingFromCourseType(type);
      course.day = $td.eq(1).text();
      course.time = $td.eq(2).text().replace(/\s/g, '').trim();
      course.location = {};
      course.location.information = $td.eq(3).text().trim();
      course.location.link = $td.eq(3).children().eq(0).attr('href');
      course.weeks = $td.eq(4).text().replace(/uge/g, '').trim();
      course.class = helperFunctions.urlToClassObject($td.eq(0).children().eq(0).attr('href'));
      course.note = $td.eq(5).children().eq(0).text().trim();

      //Adding the newly created course object to the array of courses
      build.courses.push(course);
    });
  });

  return build;
}

function removeEndingFromCourseType(type) {
  let trimmedType;

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
    case 'Computerøvelser':
      trimmedType = 'Computerøvelse';
      break;
    case 'Øvelser':
      trimmedType = 'Øvelse';
      break;
    default:
    trimmedType = type;
  }

  return trimmedType;
}

module.exports = { createCoursesObject };