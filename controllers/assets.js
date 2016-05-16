'use strict'

const colu = require('../lib/colu')
const Storage = rootRequire('lib/storage')
const validate = rootRequire('lib/validate')

exports.getAssets = function* getAssets(next) {
  var assets = yield colu.getAssetsAsync()

  this.body = assets.map(asset => asset.assetId)
  this.status = 200
}

exports.putIssue = function* putIssue(next) {
  var validation = validatePutIssueParams(this.request.body)
  if (!validation.success) {
    respondWithError(this, validation.errors)
    return
  }

  var assets = this.request.body.assets
  var assetIds = []

  for (let asset of assets) {
    var assetId = yield issueAsset(asset.assetName, asset.amount)
    assetIds.push(assetId)
  }

  this.body = assetIds
  this.status = 200
}

function validatePutIssueParams(body) {
  var assets = body.assets
  var errors = []
  var isValid = true

  assets.forEach((asset, index) => {
    var error = {}

    if (!validate.isNonEmptyString(asset.assetName)) {
      if (isValid) { isValid = false }
      error['assetName'] = validate.errors.nonEmptyString
    }

    if (!validate.isPositiveInt(asset.amount)) {
      if (isValid) { isValid = false }
      error['amount'] = validate.errors.nonPositiveInteger
    }

    errors.push(error)
  })

  if (!isValid) {
    return { success: false, errors: [ { assets: errors } ] }
  }

  return { success: true }
}

function* issueAsset(name, amount) {
  var settings = {
    metadata: {
      assetName: name
    },
    amount: amount
  }

  var result = yield colu.issueAssetAsync(settings)

  var doc = {
    assetName: name,          // Just for tracking down easily in the db file
    assetId: result.assetId,
    receivingAddress: result.receivingAddresses[0].address
  }

  yield storage().insertAsync(doc)

  return result.assetId
}

exports.postSend = function* postSend(next) {
  var validation = validatePostSendParams(this.request.body)
  if (!validation.success) {
    respondWithError(this, validation.errors)
    return
  }
  var body = this.request.body
  var address = body.toAddress
  var assetId = body.assetId
  var amount = body.amount

  var fromAddress = yield receiveAddressForAsset(assetId)
  if (!fromAddress) {
    var errors = { 'assetId': `Asset '${assetId}' was not found` }
    respondWithError(this, errors, 404)
    return
  }

  var settings = {
    from: [fromAddress],
    to: [{ address, assetId, amount }]
  }

  var result = yield colu.sendAssetAsync(settings)

  this.body = { transactionId: result.txid }
  this.status = 200
}

function validatePostSendParams(body) {
  var errors = {}

  if (!validate.isNonEmptyString(body.assetId)) {
    errors['assetId'] = validate.errors.nonEmptyString
  }

  if (!validate.isNonEmptyString(body.toAddress)) {
    errors['toAddress'] = validate.errors.nonEmptyString
  }

  if (!validate.isPositiveInt(body.amount)) {
    errors['amount'] = validate.errors.nonPositiveInteger
  }

  if (Object.keys(errors).length) {
    return { success: false, errors: errors }
  }

  return { success: true }
}

function respondWithError(ctx, errors, statusCode) {
  ctx.body = { errors: errors }
  ctx.status = statusCode || 400
}

function* receiveAddressForAsset(assetId) {
  var asset = yield storage().findOneAsync({ assetId: assetId })
  return asset && asset.receivingAddress
}

function storage() {
  return Storage(colu.hdwallet.getPrivateSeed())
}
