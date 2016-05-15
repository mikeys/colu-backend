const Promise = require('bluebird')
const Colu = require('colu')
// Support 'yield' by adding promises to prototype
Promise.promisifyAll(Colu.prototype)

var settings = {
  network: 'testnet',
  privateSeed: process.env.COLU_PRIVATE_SEED || null,
  coloredCoinsHost: 'https://testnet.api.coloredcoins.org',
  coluHost: 'https://testnet.engine.colu.co'
}

module.exports = new Colu(settings)
