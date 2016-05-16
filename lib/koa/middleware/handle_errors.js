const log = rootRequire('lib/logger')

module.exports = function* handleErrors(next) {
  try {
    log.info({
      req: this.request,
      body: this.request.body
    }, 'request received to route ' + this.path)

    yield next
  } catch (error) {
    log.error({
      err: error,
      req: this.request,
      body: this.request.body
    }, 'error handling request to ' + this.path)

    this.body = bodyFromError(error)
    this.status = error.statusCode || 500
  }
}

function bodyFromError(error) {
  return { error: error.error || error.message || error }
}
