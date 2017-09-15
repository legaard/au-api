const url = require('url');

function urlToClassObject(urlToTransform){
    let obj = {};
    const query = url.parse(urlToTransform, true).query;
  
    obj.classId = query.udbud;
    obj.classGroup = query.holdgruppe_da;
    obj.group = query.hold;
  
    return obj;
  }

  module.exports = { urlToClassObject };