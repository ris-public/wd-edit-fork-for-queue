require('should')
const CONFIG = require('config')
const addReference = require('../../lib/reference/add')
const addClaim = require('../../lib/claim/add')
const { randomString, sandboxEntity } = require('../../lib/tests_utils')

const property = 'P2002'
const value = randomString()
const claimGuidPromise = addClaim(CONFIG)(sandboxEntity, property, value)
  .then(res => res.claim.id)

describe('reference add', () => {
  it('should be a function', done => {
    addReference.should.be.a.Function()
    addReference(CONFIG).should.be.a.Function()
    done()
  })

  it('should rejected if not passed a claim guid', done => {
    addReference(CONFIG)()
    .catch(err => {
      err.message.should.equal('missing guid')
      done()
    })
    .catch(done)
  })

  it('should rejected if passed an invalid claim guid', done => {
    addReference(CONFIG)('some-invalid-guid')
    .catch(err => {
      err.message.should.equal('invalid guid')
      done()
    })
    .catch(done)
  })

  it('should rejected if not passed a property', function (done) {
    this.timeout(20 * 1000)
    claimGuidPromise
    .then(guid => {
      return addReference(CONFIG)(guid)
      .catch(err => {
        err.message.should.equal('missing property')
        done()
      })
    })
    .catch(done)
  })

  // (1)
  it('should rejected if not passed a reference value', function (done) {
    this.timeout(20 * 1000)
    claimGuidPromise
    .then(guid => {
      return addReference(CONFIG)(guid, 'P143')
      .catch(err => {
        err.message.should.equal('missing reference value')
        done()
      })
    })
    .catch(done)
  })

  // (1)
  it('should rejected if passed an invalid reference', function (done) {
    this.timeout(20 * 1000)
    claimGuidPromise
    .then(guid => {
      return addReference(CONFIG)(guid, 'P143', 'not-a-valid-reference')
      .catch(err => {
        err.message.should.equal('invalid claim value')
        done()
      })
    })
    .catch(done)
  })

  // (1)
  it('should add a reference', function (done) {
    this.timeout(20 * 1000)
    const referenceUrl = 'https://example.org/rise-and-fall-of-the-holy-sandbox-' + randomString()
    claimGuidPromise
    .then(guid => {
      return addReference(CONFIG)(guid, 'P854', referenceUrl)
      .then(res => {
        res.success.should.equal(1)
        done()
      })
    })
    .catch(done)
  })
})

// (1)
// Using an non arrow function to customize the timeout
// cf https://github.com/mochajs/mocha/issues/2018
