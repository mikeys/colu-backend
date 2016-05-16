require('./init')
const proxyquire = require('proxyquire').noCallThru()
const supertest = require('supertest-as-promised')
const validate = rootRequire('lib/validate')

var coluStub = {
  hdwallet: {
    getPrivateSeed: function() {
      return 'privateSeed'
    }
  }
}

var storageStub = {
  insertAsync: function*() { return }
}

const controller = proxyquire('../controllers/assets', {
  '../lib/colu': coluStub,
  '../lib/storage': function(seed) { return storageStub }
})

const routes = proxyquire('../lib/routes', { '../controllers/assets': controller })
const app = proxyquire('../lib/server', { './routes': routes })

describe('API', function() {
  var request

  beforeEach(function() {
    request = supertest(app.callback())
  })

  describe('POST /send', function() {
    after(function() {
      delete coluStub.sendAssetAsync
      delete storageStub.findOneAsync
    })

    describe('successful request', function() {
      var payload = {
        toAddress: 'someToAddress',
        assetId: '1234',
        amount: 3
      }

      before(function() {
        coluStub.sendAssetAsync = function*() {
          return { txid: 'XYZ', otherProp: 'ab' }
        }

        storageStub.findOneAsync = function*() {
          return 'someFromAddress'
        }
      })

      it('returns 200 status code (OK)', function() {
        return request.post('/send').type('json').send(payload).expect(200)
      })

      it('returns a transaction id', function() {
        return request.post('/send').type('json').send(payload).expect({
          transactionId: 'XYZ'
        })
      })
    })

    describe('failed request', function() {
      describe('bad params', function() {
        describe('assetId was not found', function() {
          var payload = {
            toAddress: 'someToAddress',
            assetId: 'noSuchAddress',
            amount: 3
          }

          before(function() {
            storageStub.findOneAsync = function*() {
              return null
            }
          })

          it('returns 404 status code (Not Found)', function() {
            return request.post('/send').type('json').send(payload).expect(404)
          })

          it('returns an object with the relevant error message', function() {
            return request.post('/send').type('json').send(payload).expect({
              errors: { assetId: "Asset 'noSuchAddress' was not found" }
            })
          })
        })

        it('returns 400 status code (Bad Request)', function() {
          var payload = {
            toAddress: '',
            assetId: '1234',
            amount: 3
          }

          return request.post('/send').type('json').send(payload).expect(400)
        })

        it("fails when 'amount' is not a positive integer", function*() {
          var payload = {
            toAddress: 'someToAddress',
            assetId: '1234',
            amount: '3'   // Assert case when amount is a not of integer type
          }

          var expectObj = {
            errors: { amount: validate.errors.nonPositiveInteger }
          }

          var expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert cases when 'amount' equals zero
          payload.amount = 0
          expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert case when 'amount' is negative
          payload.amount = -1
          expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert case when 'amount' is null
          payload.amount = null
          expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          return expectation
        })

        it("fails when 'toAddress' is not a non-empty string ", function*() {
          var payload = {
            toAddress: '',   // Assert case when 'toAddress' is an empty string
            assetId: '1234',
            amount: 3
          }

          var expectObj = {
            errors: { toAddress: validate.errors.nonEmptyString }
          }

          var expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert cases when 'assetName' is not a string
          payload.toAddress = 0
          expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert case when 'assetName' is null
          payload.toAddress = null
          expectation = request.post('/send').type('json').send(payload).expect(400, expectObj)
          return expectation
        })
      })

      describe('unexpected error', function() {
        var payload = {
          toAddress: 'someAddress',
          assetId: '1234',
          amount: 3
        }

        before(function() {
          coluStub.sendAssetAsync = function*() {
            throw new Error('Unexpected Error')
          }
        })

        it('returns 500 status code (Internal Server Error)', function() {
          return request.post('/send').type('json').send(payload).expect(500)
        })

        it('returns an object with the relevant error message', function() {
          return request.post('/send').type('json').send(payload).expect({
            error: 'Unexpected Error'
          })
        })
      })
    })
  })

  describe('GET /assets', function() {
    after(function() {
      delete coluStub.getAssetsAsync
    })

    describe('successful request', function() {
      before(function() {
        coluStub.getAssetsAsync = function*() {
          return [
            { assetId: '1234', otherProp: 'ab' },
            { assetId: '5678', otherProp: 'cd' }
          ]
        }
      })

      it('returns 200 status code (OK)', function() {
        return request.get('/assets').expect(200)
      })

      it('returns an array with matching asset ids', function() {
        return request.get('/assets').expect(['1234', '5678'])
      })
    })

    describe('failed request', function() {
      before(function() {
        coluStub.getAssetsAsync = function*() {
          throw new Error('Unexpected Error')
        }
      })

      it('returns 500 status code (Internal Server Error)', function() {
        return request.get('/assets').expect(500)
      })

      it('returns an object with the relevant error message', function() {
        return request.get('/assets').expect({
          error: 'Unexpected Error'
        })
      })
    })
  })

  describe('PUT /issue', function() {
    after(function() {
      delete coluStub.issueAssetAsync
    })

    describe('successful request', function() {
      var payload = {
        assets: [{
          assetName: 'Batman Ticket',
          amount: 38
        }, {
          assetName: 'Spiderman Ticket',
          amount: 50
        }]
      }

      function issueAssetStubInit() {
        var callCount = 0
        var results = [
          { assetId: '1234', receivingAddresses: [ { address: 'address1' } ] },
          { assetId: '5678', receivingAddresses: [ { address: 'address2' } ] }
        ]

        return function() {
          coluStub.issueAssetAsync = function*() {
            return results[callCount++]
          }
        }
      }

      it('returns 200 status code (OK)', function() {
        issueAssetStubInit()()
        return request.put('/issue').type('json').send(payload).expect(200)
      })

      it('returns issued asset ids', function() {
        issueAssetStubInit()()
        return request.put('/issue').type('json').send(payload)
          .expect(200, [1234, 5678])
      })
    })

    describe('failed request', function() {
      describe('bad params', function() {
        it('returns 400 status code (Bad Request)', function() {
          var payload = {
            assets: [{
              amount: '38'
            }, {
              assetName: 'Spiderman Ticket',
              amount: 50
            }]
          }

          return request.put('/issue').type('json').send(payload).expect(400)
        })

        it("fails when 'amount' is not a positive integer for each item", function*() {
          var payload = {
            assets: [{
              assetName: 'Batman Ticket',
              amount: '38'  // Assert cases when 'amount' is non integer
            }, {
              assetName: 'Spiderman Ticket',
              amount: 50
            }]
          }

          var expectObj = {
            errors: [{
              assets: [{ amount: validate.errors.nonPositiveInteger }, {}]
            }]
          }

          var expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert cases when 'amount' equals zero
          payload.assets[0].amount = 0
          expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert case when 'amount' is negative
          payload.assets[0].amount = -1
          expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert case when 'amount' is null
          payload.assets[0].amount = null
          expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          return expectation
        })

        it("fails when 'assetName' is not a non-empty string for each item", function*() {
          var payload = {
            assets: [{
              assetName: '',  // Assert cases when 'assetName' is an empty string
              amount: 38
            }, {
              assetName: 'Spiderman Ticket',
              amount: 50
            }]
          }

          var expectObj = {
            errors: [{
              assets: [{ assetName: validate.errors.nonEmptyString }, {}]
            }]
          }

          var expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert cases when 'assetName' is not a string
          payload.assets[0].assetName = 0
          expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          yield expectation

          // Assert case when 'assetName' is null
          payload.assets[0].assetName = null
          expectation = request.put('/issue').type('json').send(payload).expect(400, expectObj)
          return expectation
        })
      })

      describe('unexpected error', function() {
        var payload = {
          assets: [{
            assetName: 'Batman Ticket',
            amount: 38
          }, {
            assetName: 'Spiderman Ticket',
            amount: 50
          }]
        }

        before(function() {
          coluStub.issueAssetAsync = function*() {
            throw new Error('Unexpected Error')
          }
        })

        it('returns 500 status code (Internal Server Error)', function() {
          return request.put('/issue').type('json').send(payload).expect(500)
        })

        it('returns an object with the relevant error message', function() {
          return request.put('/issue').type('json').send(payload).expect({
            error: 'Unexpected Error'
          })
        })
      })
    })
  })
})
