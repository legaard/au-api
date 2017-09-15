const cluster = require('cluster');
const logger = require('./utils/logger');
const numberOfCPUs = require('os').cpus().length;

const workersToStart = numberOfCPUs - 1;

if(cluster.isMaster){
  for (var i = 0; i < workersToStart; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.info(`worker ${worker.process.pid} died`);
    cluster.fork();
  });

  logger.info(`successfully started ${workersToStart} workers`);
} else {
  require('./index');
}
