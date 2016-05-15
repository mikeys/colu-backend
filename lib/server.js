const app = require('koa')()
const bodyParser = require('koa-bodyparser')
const routes = rootRequire('lib/routes')
const handleErrors = rootRequire('lib/koa/middleware/handle_errors')

app.use(bodyParser())
app.use(handleErrors)
app.use(routes)

module.exports = app
