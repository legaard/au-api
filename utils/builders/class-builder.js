const cheerio = require('cheerio');

function createClassObject(htmlString){
    //Creating the cheerio and build object
    let build = {};
    const $ = cheerio.load(htmlString);
    const $body = $('body');
  
    const courseName = $('h2', $body).eq(0).text().trim();
    const numberOfStudents = $('h2', $body).eq(1).text();
    const tempArray = numberOfStudents.split(' ');
  
    build.numberOfStudents = numberOfStudents.indexOf('ingen studerende') > -1 ? undefined : parseInt(tempArray[tempArray.length - 2].substring(1), 10);
    build.courseName = courseName;
    build.students = [];
  
    if (!build.numberOfStudents) throw new Error('No classes found');
  
    $('tr', $body).each(function(index, element) { 
      build.students.push($('td', this).eq(1).text().trim());
    });

    return build;
}

module.exports = { createClassObject };