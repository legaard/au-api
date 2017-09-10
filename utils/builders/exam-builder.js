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
        return undefined;
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
          exam.type = type;
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
    
      return build;
    }