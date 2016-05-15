const bunyan = require('bunyan')

module.exports = bunyan.createLogger({
  name: 'Colu Backend Task',
  level: 'info',
  serializers: bunyan.stdSerializers,
  stream: process.stdout
})
