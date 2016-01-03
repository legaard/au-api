var logger = require('simple-node-logger').createSimpleLogger('server.log');

function logInfo(source, output){
  logger.info(source, '\t==>\t', output);
}

function logError(source, output){
  logger.error(source, '\t==>\t', output);
}

module.exports = {
  logInfo: logInfo,
  logError: logError
};
