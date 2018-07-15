const cheerio = require('cheerio');

const helperFunctions = require('./helper-functions');

function createExamObject(htmlString){
      //Creating the cheerio and build object
      let build = {};
      const $ = cheerio.load(htmlString);
      const $body = $('body');
    
      //Retrieving the student name (if it exists)
      const studentName = $('h2', $body).text();
      build.studentName =  studentName.indexOf('for') > -1 ? studentName.split('for')[1].trim() : undefined;
    
      //Return an error if no student match the id provided
      if(!build.studentName) throw new Error('No exams found for student');
    
      //Creating an array for the exams
      build.exams = [];
    
      //Iterating over the tables
      $('table', $body).each(function(i, e){
        const examName = $(this).prevAll('h3').first().text();
        const type = $(this).prevAll('strong').first().text();
        const $tr = $(this).children();

        $tr.each(function(index, element) {
          let exam = {};
          const $td = $('td', element);
    
          //Adding properties to the exam object
          exam.examName = examName;
          exam.type = type;
          exam.date = $td.eq(1).text().trim();
          exam.time = $td.eq(2).text().replace(/\s/g, '').trim();
          exam.location = {};
          exam.location.information = $td.eq(3).text().trim();
          exam.location.link = $td.eq(3).children().eq(0).attr('href');
          exam.class = helperFunctions.urlToClassObject($td.eq(0).children().eq(0).attr('href'));
          exam.note = $td.eq(5).children().eq(0).text().trim();
    
          //Adding the exam object to the response objects array
          build.exams.push(exam);
        });
      });
    
      return build;
    }

    module.exports = { createExamObject };