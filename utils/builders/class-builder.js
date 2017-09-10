const cheerio = require('cheerio');

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
      return undefined;
    }
  
    $('tr', $body).each(function(i, element){
      build.students.push($('td', this).eq(1).text().trim());
    });
  
    return build;
  }