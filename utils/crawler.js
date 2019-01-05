const iconv = require('iconv-lite');
const request = require('request-promise-native');
const tough = require('tough-cookie');

const logger = require('./logger');
const { classBuilder, courseBuilder, examBuilder } = require('./builders/builders'); 

const SESSION_UPDATE_INTERVAL = 20;
const TIME_OUT = 8000;
const HTTP_METHOD = {
  POST: 'POST',
  GET: 'GET'
};

const language = 'da';

const domain = 'https://timetable.scitech.au.dk';
const examAndCoursesUrl = `${domain}/apps/skema/ElevSkema.asp`;
const classUrl = `${domain}/apps/skema/holdliste.asp`;

const examSessionUrl =  `${domain}/apps/skema/VaelgelevSkema.asp?webnavn=eksamen`;
const coursesSessionUrl = `${domain}/apps/skema/VaelgelevSkema.asp?webnavn=skema`;

const examWinterJar = request.jar();
const examSummerJar = request.jar();
const coursesJar = request.jar();

function getCourseData(studentId) {
  const options = buildRequestOptions(studentId, HTTP_METHOD.POST, examAndCoursesUrl, coursesJar);

  return new Promise((resolve, reject) => {
    request(options)
      .then(response => {
        try {
          const courses = courseBuilder.createCoursesObject(decode(response));

          resolve(courses);
        } catch (error) {
          resolve(null);
        }
      })
      .catch(() => reject('Failed to retrieve data from AU'));
  });
}

function getAllExamData(studentId) {
  const summerRequestOptions = buildRequestOptions(studentId, HTTP_METHOD.POST, examAndCoursesUrl, examSummerJar);
  const winterRequestOptions = buildRequestOptions(studentId, HTTP_METHOD.POST, examAndCoursesUrl, examWinterJar);
  const summerRequest = request(summerRequestOptions);
  const winterRequest = request(winterRequestOptions);;

  return new Promise((resolve, reject) => {
    Promise.all([winterRequest, summerRequest])
      .then(values => {
        try {
          let data = examBuilder.createExamObject(decode(values[0]));
          const summerExams = examBuilder.createExamObject(decode(values[1]));
          data.exams = data.exams.concat(summerExams.exams);

          resolve(data);
        } catch (error) {
          resolve(null);
        }
      }).catch(() => reject('Failed to retrieve data from AU'));
  });
}

function getExamData(studentId, periode) {
  let examJar;
  
  switch (periode) {
    case examPeriodes.winter: {
      examJar = examWinterJar;
      break;
    }
    case examPeriodes.summer: {
      examJar = examSummerJar;
      break;
    }
    default: {
      return Promise.reject(`Invalid periode provided. Valid periods: ${Object.values(examPeriodes)}`);
    }
  }
  
  const options = buildRequestOptions(studentId, HTTP_METHOD.POST, examAndCoursesUrl, examJar);

  return new Promise((resolve, reject) => {
    request(options)
      .then(response => {
        try {
          const exams = examBuilder.createExamObject(decode(response));

          resolve(exams);
        } catch (error) {
          resolve(null);          
        }
      })
      .catch(() => reject('Failed to retrieve data from AU'));
  });
}

function getClassData(classId, classGroup, group) {
  classId = encodeToWindows1252(classId);
  classGroup = encodeToWindows1252(classGroup);
  group = encodeToWindows1252(group);

  const url = `${classUrl}?udbud=${classId}&holdgruppe_da=${classGroup}&hold=${group}`;
  
  var options = {
    uri: url,
    encoding: null,
    timeout: TIME_OUT,
  };

  return new Promise((resolve, reject) => {
    request(options)
      .then(response => {
        try {
          const classes = classBuilder.createClassObject(decode(response));

          resolve(classes);
        } catch (error) {
          resolve(null);          
        }
      })
      .catch(() => reject('Failed to retrieve data from AU'));
  });
}

function updateSession(url, jar) {
  const options = {
    uri: url,
    timeout: TIME_OUT,
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

function buildRequestOptions(studentId, method, url, jar) {
  return {
    method: method,
    uri: url,
    encoding: null,
    jar: jar,
    timeout: TIME_OUT,
    form: {'B1': 'S%F8g', 'aarskort': studentId}
  };
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
  updateSession(`${examSessionUrl}v&sprog=${language}`, examWinterJar);
  updateSession(`${examSessionUrl}s&sprog=${language}`, examSummerJar);
  logger.info('updated all sessions');
}

const examPeriodes = {
  winter: 'winter',
  summer: 'summer'
};

updateAllSessions();
setInterval(() => updateAllSessions(), 1000 * 60 * SESSION_UPDATE_INTERVAL);

module.exports = {
  getCourseData,
  getExamData,
  getAllExamData,
  getClassData,
  examPeriodes
};