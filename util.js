function logStatement(source, output){
  console.log(source + '\t-->', output);
  //TODO: Log output to a log file
}

module.exports = {
  logStatement: logStatement
};
