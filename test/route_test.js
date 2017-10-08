/* global describe, it */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const routes = require('../routes')
const apiUrl = routes.apiUrl

const expect = chai.expect

describe('API -', () => {
  const CONFIG = {
    ghId: '964172a90e5c25e97616',
    ghSecret: 'mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg=='
  }

  describe('Get path with params', () => {
    it('Get filepath with file and path', () => {
      const params = {
        path: 'berthe/',
        0: 'dugris.md'
      }
      expect(apiUrl.getPath(params)).to.be.equal('berthe/dugris.md')
    })
    it('Get filepath without path', () => {
      const params = {
        path: 'README.md',
        0: ''
      }
      expect(apiUrl.getPath(params)).to.be.equal('README.md')
    })
    it('Get path without file', () => {
      const params = {
        path: 'vendor',
        0: '/fetch/truc'
      }
      expect(apiUrl.getPath(params)).to.be.equal('vendor/fetch/truc')
    })
  })

  describe('Check filename extension', () => {
    it('Check .md extension', () => {
      expect(apiUrl.isValidFileExt('readme.md')).to.be.true
    })
    it('Check bad extension', () => {
      expect(apiUrl.isValidFileExt('readme.doc')).to.be.false
    })
  })
})
