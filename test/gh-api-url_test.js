/* global describe, it */

const chai = require('chai')
const ghApiUrl = require('../gh-api-url')

const expect = chai.expect

describe('Github Api Url -', () => {
  const authRateLimit = {
    ghId: '964172a90e5c25e97616',
    ghSecret: 'mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg=='
  }
  describe('Add token to increase github rate limit', () => {
    it('responds empty query when gh_secret or gh_id not present', () => {
      const url = 'https://api.github.com/repos/foo/bar/contents'
      expect(ghApiUrl.addAuth(url, { ghId: authRateLimit.ghId })).to.be.equal(url)
      expect(ghApiUrl.addAuth(url, { ghSecret: authRateLimit.ghSecret })).to.be.equal(url)
    })
    it('add query when gh_secret or gh_id are present', () => {
      const url = 'https://api.github.com/repos/foo/bar/contents?branch=master'
      expect(ghApiUrl.addAuth(url, authRateLimit)).to.be.equal(
        `${url}&client_id=964172a90e5c25e97616&client_secret=mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg==`
      )
    })
    it('add ? when query is not presents', () => {
      const url = 'https://api.github.com/repos/foo/bar/contents'
      expect(ghApiUrl.addAuth(url, authRateLimit)).to.be.equal(
        `${url}?client_id=964172a90e5c25e97616&client_secret=mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg==`
      )
    })
  })
})
