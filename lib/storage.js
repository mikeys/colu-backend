const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
Promise.promisifyAll(Datastore.prototype)

var cache = {}

module.exports = function Storage(seed) {
  if (!(seed in cache)) {
    cache[seed] = new Datastore({
      filename: dbFilePath(seed),
      autoload: true
    })
  }

  return cache[seed]
}

function dbFilePath(seed) {
  return path.join(__dirname, '../db', `${seed}.db`)
}
