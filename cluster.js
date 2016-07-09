var cluster = require('cluster'),
    logger = require('./logger'),
    numberOfCPUs = require('os').cpus().length;

var _className = 'CLUSTER',
    workersToStart = numberOfCPUs - 1;

if(cluster.isMaster){
  for (var i = 0; i < workersToStart; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal){
    logger.logInfo(_className, 'Worker ' + worker.process.pid + ' died');
    cluster.fork();
  });

  logger.logInfo(_className, 'Successfully started ' + workersToStart + ' workers');
} else {
  require('./server');
}
