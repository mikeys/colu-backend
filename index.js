const path = require('path')
const co = require('co')

// Avoid ugly relative require's (such as require('../../lib/db'))
global.rootRequire = function(name) {
  return require(path.join(__dirname, '/', name))
}

const colu = rootRequire('lib/colu')
const server = rootRequire('lib/server')
global.log = rootRequire('lib/logger')

const port = process.env.PORT || 3000

co(function *() {
  yield colu.initAsync()
  log.info('Colu SDK initialized.')

  server.listen(port)
  log.info(`Server listening on port ${port}.`)
}).catch(err => {
  log.error(err)
})
