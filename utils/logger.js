const logger = require('simple-node-logger').createSimpleLogger({
	logFilePath: 'server.log',
	timestampFormat: 'YYYY-MM-DD HH:mm:ss'
});

module.exports = logger;