require('../common')
require('co-mocha')

// Mute logs when running tests
const bunyan = require('bunyan')
rootRequire('lib/logger').level(bunyan.FATAL + 1)
