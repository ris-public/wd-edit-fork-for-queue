require('should')
const CONFIG = require('config')
const setAlias = require('../../lib/alias/set')(CONFIG)
const { randomString, sandboxEntity } = require('../../lib/tests_utils')
const language = 'it'

describe('alias set', function () {
  this.timeout(20 * 1000)

  it('should be a function', done => {
    setAlias.should.be.a.Function()
    done()
  })

  it('should reject if not passed an entity', done => {
    setAlias()
    .catch(err => {
      err.message.should.equal('invalid entity')
      done()
    })
    .catch(done)
  })

  it('should reject if not passed a language', done => {
    setAlias(sandboxEntity)
    .catch(err => {
      err.message.should.equal('invalid language')
      done()
    })
    .catch(done)
  })

  it('should reject if not passed an alias', done => {
    setAlias(sandboxEntity, language)
    .catch(err => {
      err.message.should.equal('empty alias array')
      done()
    })
    .catch(done)
  })

  it('should accept a single alias string', done => {
    setAlias(sandboxEntity, language, randomString(4))
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should accept multiple aliases as an array of strings', done => {
    setAlias(sandboxEntity, language, [ randomString(4), randomString(4) ])
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should set an alias', done => {
    const alias = `Bac à Sable (${randomString()})`
    setAlias(sandboxEntity, 'fr', alias)
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })
})
