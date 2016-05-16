exports.isPositiveInt = function isPositiveInt(obj) {
  return Number.isInteger(obj) && obj > 0
}

exports.isNonEmptyString = function isNonEmptyString(obj) {
  return typeof obj === 'string' && obj.length > 0
}

exports.errors = Object.freeze({
  nonEmptyString: 'must me a non-empty string',
  nonPositiveInteger: 'must be a positive integer'
})
