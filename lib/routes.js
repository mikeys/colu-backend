const router = require('koa-router')()
const controller = rootRequire('controllers/assets')

router.get('/assets', controller.getAssets)
router.put('/issue', controller.putIssue)
router.post('/send', controller.postSend)

module.exports = router.routes()
