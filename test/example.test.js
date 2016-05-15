require('co-mocha')
require('chai').should()

describe('example', function() {
  it('should do something', function*() {
    var res = yield Promise.resolve(true)
    res.should.be.true
  })
})
