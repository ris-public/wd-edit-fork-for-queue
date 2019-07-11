const should = require('should')
const CONFIG = require('config')
const editEntity = require('../../lib/entity/edit')(CONFIG)
const { randomString, sandboxEntity, sandboxDescriptionFr } = require('../../lib/tests_utils')
const wdk = require('wikidata-sdk')

describe('entity edit', function () {
  this.timeout(20 * 1000)

  it('should be a function', done => {
    editEntity.should.be.a.Function()
    done()
  })

  it('should reject a missing id', done => {
    editEntity.should.be.a.Function()
    editEntity({ claims: { P31: 'bla' } })
    .catch(err => {
      err.message.should.equal('invalid entity id')
      done()
    })
    .catch(done)
  })

  it('should reject an edit without data', done => {
    editEntity.should.be.a.Function()
    editEntity({ id: sandboxEntity })
    .catch(err => {
      err.message.should.equal('no data was passed')
      done()
    })
    .catch(done)
  })

  it('should reject invalid claims', done => {
    editEntity.should.be.a.Function()
    editEntity({ id: sandboxEntity, claims: { P31: 'bla' } })
    .catch(err => {
      err.message.should.equal('invalid entity value')
      done()
    })
    .catch(done)
  })

  it('should reject invalid labels', done => {
    editEntity.should.be.a.Function()
    editEntity({ id: sandboxEntity, labels: { fr: '' } })
    .catch(err => {
      err.message.should.equal('invalid label')
      done()
    })
    .catch(done)
  })

  it('should reject invalid descriptions', done => {
    editEntity.should.be.a.Function()
    editEntity({ id: sandboxEntity, descriptions: { fr: '' } })
    .catch(err => {
      err.message.should.equal('invalid description')
      done()
    })
    .catch(done)
  })

  it('should edit an entity', done => {
    const label = `Bac à Sable (${randomString()})`
    const description = `${sandboxDescriptionFr} (${randomString()})`
    editEntity({
      id: sandboxEntity,
      labels: { fr: label },
      aliases: { fr: `bàs ${randomString()}`, en: [ `sandbox ${randomString()}` ] },
      descriptions: { fr: description },
      claims: { P1775: 'Q3576110' }
    })
    .then(res => {
      res.success.should.equal(1)
      res.entity.labels.fr.value.should.equal(label)
      res.entity.descriptions.fr.value.should.equal(description)
      const P1775Claims = wdk.simplifyPropertyClaims(res.entity.claims.P1775)
      P1775Claims.includes('Q3576110').should.be.true()
      done()
    })
    .catch(done)
  })

  it('should edit an entity with qualifiers', done => {
    editEntity({
      id: sandboxEntity,
      claims: {
        P369: [
          { value: 'Q5111731', qualifiers: { P1545: '17', P1416: [ 'Q13406268' ] } },
          {
            value: 'Q2622002',
            qualifiers: {
              P580: '1789-08-04',
              P1106: { amount: 9001, unit: 'Q7727' },
              P1476: { text: 'bulgroz', language: 'fr' }
            }
          }
        ]
      }
    })
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should edit an entity with rich qualifier', done => {
    const qualifiers = {
      P2109: [ { value: { amount: 100, unit: 'Q6982035' } } ]
    }
    editEntity({
      id: sandboxEntity,
      claims: {
        P516: [ { value: 'Q54173', qualifiers } ]
      }
    })
    .then(res => {
      res.success.should.equal(1)
      const lastClaim = res.entity.claims.P516.slice(-1)[0]
      const qualifier = lastClaim.qualifiers.P2109[0]
      qualifier.datavalue.value.amount.should.equal('+100')
      qualifier.datavalue.value.unit.should.equal('http://www.wikidata.org/entity/Q6982035')
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a qualifier with a special snaktype', done => {
    const qualifiers = {
      P571: { snaktype: 'somevalue' }
    }
    editEntity({
      id: sandboxEntity,
      claims: {
        P516: [ { value: 'Q54173', qualifiers } ]
      }
    })
    .then(res => {
      res.success.should.equal(1)
      const lastClaim = res.entity.claims.P516.slice(-1)[0]
      const qualifier = lastClaim.qualifiers.P571[0]
      qualifier.snaktype.should.equal('somevalue')
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a time qualifier', done => {
    const qualifiers = {
      P571: { value: '2019-04-01T00:00:00.000Z' }
    }
    editEntity({
      id: sandboxEntity,
      claims: {
        P516: [ { value: 'Q54173', qualifiers } ]
      }
    })
    .then(res => {
      res.success.should.equal(1)
      const lastClaim = res.entity.claims.P516.slice(-1)[0]
      const qualifier = lastClaim.qualifiers.P571[0]
      qualifier.datavalue.value.time.should.equal('+2019-04-01T00:00:00Z')
      qualifier.datavalue.value.precision.should.equal(11)
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a reference', done => {
    const reference = {
      P855: 'https://example.org',
      P143: 'Q8447'
    }
    editEntity({
      id: sandboxEntity,
      claims: {
        P369: { value: 'Q2622002', references: reference }
      }
    })
    .then(res => {
      res.success.should.equal(1)
      const lastClaim = res.entity.claims.P369.slice(-1)[0]
      const urlRef = lastClaim.references[0].snaks.P855[0]
      urlRef.datavalue.value.should.equal('https://example.org')
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a reference formatted with a snaks object', done => {
    const reference = {
      snaks: {
        P855: 'https://example.org',
        P143: 'Q8447'
      }
    }
    editEntity({
      id: sandboxEntity,
      claims: {
        P369: { value: 'Q2622002', references: [ reference ] }
      }
    })
    .then(res => {
      res.success.should.equal(1)
      const lastClaim = res.entity.claims.P369.slice(-1)[0]
      const urlRef = lastClaim.references[0].snaks.P855[0]
      urlRef.datavalue.value.should.equal('https://example.org')
      done()
    })
    .catch(done)
  })

  it('should edit an entity with multiple references', done => {
    editEntity({
      id: sandboxEntity,
      claims: {
        P369: [
          {
            value: 'Q2622002',
            references: [
              { P855: 'https://example.org', P143: 'Q8447' },
              { P855: 'https://example2.org', P143: 'Q8447' }
            ]
          }
        ]
      }
    })
    .then(res => {
      res.success.should.equal(1)
      const lastClaim = res.entity.claims.P369.slice(-1)[0]
      const urlRef = lastClaim.references[0].snaks.P855[0]
      urlRef.datavalue.value.should.equal('https://example.org')
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a monolingual text claim', done => {
    editEntity({
      id: sandboxEntity,
      claims: { P1705: { text: 'Lundeborg', 'language': 'mul' } }
    })
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a quantity claim', done => {
    editEntity({
      id: sandboxEntity,
      claims: { P1106: { amount: 9001, unit: 'Q7727' } }
    })
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a rich value and qualifiers', done => {
    editEntity({
      id: sandboxEntity,
      claims: {
        P1106: {
          value: { amount: 9002, unit: 'Q7727' },
          qualifiers: { P580: '1789-08-04' }
        }
      }
    })
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should edit an entity with a globe coordinate claim', done => {
    editEntity({
      id: sandboxEntity,
      claims: { P626: { latitude: 45.758, longitude: 4.84138, precision: 1 / 360 } }
    })
    .then(res => {
      res.success.should.equal(1)
      done()
    })
    .catch(done)
  })

  it('should edit an entity with special snaktypes', done => {
    editEntity({
      id: sandboxEntity,
      claims: {
        P369: { snaktype: 'somevalue' },
        P626: { snaktype: 'novalue' }
      }
    })
    .then(res => {
      res.success.should.equal(1)
      res.entity.claims.P369.slice(-1)[0].mainsnak.snaktype.should.equal('somevalue')
      res.entity.claims.P626.slice(-1)[0].mainsnak.snaktype.should.equal('novalue')
      done()
    })
    .catch(done)
  })

  it('should edit an entity with special rank', done => {
    editEntity({
      id: sandboxEntity,
      claims: {
        P369: { rank: 'deprecated', snaktype: 'somevalue' },
        P626: { rank: 'deprecated', latitude: 0.1, longitude: 0.1, precision: 1 / 360 },
        P6089: { rank: 'preferred', value: 123 }
      }
    })
    .then(res => {
      res.success.should.equal(1)
      res.entity.claims.P369.slice(-1)[0].rank.should.equal('deprecated')
      res.entity.claims.P369.slice(-1)[0].mainsnak.snaktype.should.equal('somevalue')
      res.entity.claims.P626.slice(-1)[0].rank.should.equal('deprecated')
      res.entity.claims.P626.slice(-1)[0].mainsnak.datavalue.value.latitude.should.equal(0.1)
      res.entity.claims.P626.slice(-1)[0].mainsnak.datavalue.value.longitude.should.equal(0.1)
      res.entity.claims.P626.slice(-1)[0].mainsnak.datavalue.value.precision.should.equal(0.0027777777777778)
      res.entity.claims.P6089.slice(-1)[0].rank.should.equal('preferred')
      res.entity.claims.P6089.slice(-1)[0].mainsnak.datavalue.value.amount.should.equal('+123')
      done()
    })
    .catch(done)
  })

  it('should be able to remove a claim', done => {
    editEntity({
      id: sandboxEntity,
      claims: { P369: sandboxEntity }
    })
    .then(res => {
      const guid = res.entity.claims.P369.slice(-1)[0].id
      return editEntity({
        id: sandboxEntity,
        claims: { P369: { id: guid, remove: true } }
      })
      .then(res => {
        res.success.should.equal(1)
        const propClaims = res.entity.claims.P369
        if (propClaims) {
          const guids = propClaims.map(claim => claim.id)
          guids.includes(guid).should.be.false()
        }
        done()
      })
    })
    .catch(done)
  })

  it('should be able to remove a label, description, or alias', done => {
    const label = randomString()
    const description = randomString()
    const alias = randomString()
    editEntity({
      id: sandboxEntity,
      labels: { la: label },
      descriptions: { la: description },
      aliases: { la: alias }
    })
    .then(res => {
      return editEntity({
        id: sandboxEntity,
        labels: { la: { value: label, remove: true } },
        descriptions: { la: { value: description, remove: true } },
        aliases: { la: { value: alias, remove: true } }
      })
      .then(res => {
        res.success.should.equal(1)
        should(res.entity.labels.la).not.be.ok()
        should(res.entity.descriptions.la).not.be.ok()
        if (res.entity.aliases.la != null) {
          res.entity.aliases.la.forEach(alias => {
            alias.value.should.not.equal('foo')
          })
        }
        done()
      })
    })
    .catch(done)
  })

  it('should be able to add and remove a sitelink', done => {
    const frwikinews = 'Évènements du 16 novembre 2018'
    editEntity({
      id: sandboxEntity,
      sitelinks: { frwikinews }
    })
    .then(res => {
      res.entity.sitelinks.frwikinews.title.should.equal(frwikinews)
      return editEntity({
        id: sandboxEntity,
        sitelinks: { frwikinews: { value: frwikinews, remove: true } }
      })
      .then(res => {
        should(res.entity.sitelinks.frwikinews).not.be.ok()
        done()
      })
    })
    .catch(done)
  })

  it('should edit the existing claim when passed an id', done => {
    editEntity({
      id: sandboxEntity,
      claims: { P370: 'ABC' }
    })
    .then(res => {
      const claim = res.entity.claims.P370.slice(-1)[0]
      return editEntity({
        id: sandboxEntity,
        claims: { P370: { id: claim.id, value: 'DEF', rank: 'preferred' } }
      })
      .then(res => {
        const updatedClaim = res.entity.claims.P370.find(propClaim => propClaim.id === claim.id)
        console.log('updatedClaim', updatedClaim)
        updatedClaim.mainsnak.datavalue.value.should.equal('DEF')
        updatedClaim.rank.should.equal('preferred')
        done()
      })
    })
    .catch(done)
  })
})
