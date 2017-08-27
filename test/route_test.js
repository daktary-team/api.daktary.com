/* eslint-disable max-len */

const chai = require('chai')
const routes = require('../routes')

const expect = chai.expect

describe('API -', () => {
    const CONFIG = {
        ghId: '964172a90e5c25e97616',
        ghSecret: 'mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg=='
    }
    describe('Add token to increase github rate limit', () => {
        it('Respond empty string when gh_secret or gh_id not present', () => {
            expect(routes.addAuth(CONFIG.ghId, undefined)).to.be.equal('')
            expect(routes.addAuth(undefined, CONFIG.ghSecret)).to.be.equal('')
        })
        it('Respond correct string when gh_secret or gh_id are present', () => {
            expect(routes.addAuth(CONFIG.ghId, CONFIG.ghSecret)).to.be.equal(
                '&client_id=964172a90e5c25e97616&client_secret=mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg=='
            )
        })
    })
    describe('Add query', () => {
        it('Query start with default branch \'master\'', () => {
            expect(routes.query()).to.match(/^\?ref=master/)
        })
        it('Query start with specify branch', () => {
            expect(routes.query('gh-pages')).to.match(/^\?ref=gh-pages/)
        })
        it('Query add token', () => {
            expect(routes.query('undefined', CONFIG)).to.contains('&client_id=')
            expect(routes.query('undefined', CONFIG)).to.contains('&client_secret=')
        })
    })
})
