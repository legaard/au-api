const iconv = require('iconv-lite');
const request = require('request-promise-native');
const tough = require('tough-cookie');

const logger = require('./logger');
const classBuilder = require('./builders/class-builder');
const courseBuilder = require('./builders/course-builder');
const examBuilder = require('./builders/exam-builder');

const SESSION_UPDATE_INTERVAL = 45;

const domain = 'http://timetable.scitech.au.dk';
const examAndCoursesUrl = `${domain}/apps/skema/ElevSkema.asp`;
const classUrl = `${domain}/apps/skema/holdliste.asp`;

const timeoutThreshold = 8000;
const language = 'da';

const examSessionUrl =  `${domain}/apps/skema/VaelgelevSkema.asp?webnavn=eksamen`;
const coursesSessionUrl = `${domain}/apps/skema/VaelgelevSkema.asp?webnavn=skema`;

const examFirstQuarterJar = request.jar();
const examSecondQuarterJar = request.jar();
const examThirdQuarterJar = request.jar();
const examFourthQuarterJar = request.jar();
const coursesJar = request.jar();

function getCourseData(studentId) {
  const options = {
    method: 'POST',
    uri: examAndCoursesUrl,
    encoding: null,
    jar: coursesJar,
    timeout: timeoutThreshold,
    form: {'B1': 'S%F8g', 'aarskort': studentId}
  };

  return new Promise((resolve, reject) => {
    request(options)
      .then(response => {
        try {
          const decodedResponse = decode(response);
          const courses = courseBuilder.createCoursesObject(decodedResponse);
          resolve(courses);
        } catch (error) {
          reject(error.message);
        }
      })
      .catch(error => reject('Failed to retrieve data from AU'));
  });
}

function getExamData(quarter, studentId) {
  let examJar;
  
  switch (quarter) {
    case '1': {
      examJar = examFirstQuarterJar;
      break;
    }
    case '2': {
      examJar = examSecondQuarterJar;
      break;
    }
    case '3': {
      examJar = examThirdQuarterJar;
      break;
    }
    case '4': {
      examJar = examFourthQuarterJar;
      break;
    }
  }
    
  var options = {
    method: 'POST',
    uri: examAndCoursesUrl,
    encoding: null,
    jar: examJar,
    timeout: timeoutThreshold,
    form: {'B1': 'S%F8g', 'aarskort': studentId}
  };
  
  return new Promise((resolve, reject) => {
    request(options)
      .then(response => {
        try {
          const decodedResponse = decode(response);
          const exams = examBuilder.createExamObject(decodedResponse);
          resolve(exams);
        } catch (error) {
          reject(error.message);
        }
      })
      .catch(error => reject('Failed to retrieve data from AU'));
  });
}

function getClassData(classId, classGroup, group) {
  classId = encodeToWindows1252(classId);
  classGroup = encodeToWindows1252(classGroup);
  group = encodeToWindows1252(group);

  const url = `${classUrl}?udbud=${classId}&holdgruppe_${language}=${classGroup}&hold=${group}`;
  
  var options = {
    uri: url,
    encoding: null,
    timeout: timeoutThreshold,
  };

  return new Promise((resolve, reject) => {
    request(options)
      .then(response => {
        try {
          const decodedResponse = decode(response);
          const classes = classBuilder.createClassObject(decodedResponse);
          resolve(classes);
        } catch (error) {
          reject(error.message);
        }
      })
      .catch(error => reject('Failed to retrieve data from AU'));
  });
}

function updateSession(url, jar) {
  const options = {
    uri: url,
    timeout: timeoutThreshold,
    resolveWithFullResponse: true
  };

  request(options)
    .then((response) => {
      const cookieString = response.headers['set-cookie'][0].split(';')[0];
      const key = cookieString.split('=')[0];
      const value = cookieString.split('=')[1];

      const cookie = new tough.Cookie({key, value});
      jar.setCookie(cookie, `${domain}/apps/skema/`);
    })
    .catch(error => logger.error(`failed to update session for ${url}! error: ${error}`));
}

// decoding function: turns iso-8859-1 into utf-8
function decode(data){
  const buffer = iconv.decode(data, 'iso-8859-1');
  return buffer.toString('utf-8');
}

function encodeToWindows1252(stringToEncode){
  return stringToEncode
    .replace('Ø', '%D8')
    .replace('ø', '%F8')
    .replace('Å', '%C5')
    .replace('å', '%E5')
    .replace('Æ', '%C6')
    .replace('æ', '%E6');
}

function updateAllSessions() {
  updateSession(`${coursesSessionUrl}&sprog=${language}`, coursesJar);
  updateSession(`${examSessionUrl}1&sprog=${language}`, examFirstQuarterJar);
  updateSession(`${examSessionUrl}2&sprog=${language}`, examSecondQuarterJar);
  updateSession(`${examSessionUrl}3&sprog=${language}`, examThirdQuarterJar);
  updateSession(`${examSessionUrl}4&sprog=${language}`, examFourthQuarterJar);
}

updateAllSessions();
setInterval(() => updateAllSessions(), 1000 * 60 * SESSION_UPDATE_INTERVAL);

module.exports = {
  getCourseData,
  getExamData,
  getClassData
};