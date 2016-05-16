const path = require('path')

// Avoid ugly relative require's (such as require('../../lib/db'))
global.rootRequire = function(name) {
  return require(path.join(__dirname, '/', name))
}

global.log = rootRequire('lib/logger')

