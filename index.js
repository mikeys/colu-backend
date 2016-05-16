require('./common')

const co = require('co')
const colu = rootRequire('lib/colu')
const server = rootRequire('lib/server')

const port = process.env.PORT || 3000

co(function *() {
  yield colu.initAsync()
  log.info('Colu SDK initialized.')

  server.listen(port)
  log.info(`Server listening on port ${port}.`)
}).catch(err => {
  log.error(err)
})
