var logger = require('simple-node-logger').createSimpleLogger({
	logFilePath:'server.log',
	timestampFormat:'YYYY-MM-DD HH:mm:ss'
});

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
