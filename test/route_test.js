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

  describe('Create the Github Api Url for document', () => {
    it('with file params, it return Url', () => {
      const params = {
        localDomain: 'https://api.daktary.com',
        owner: 'Antonin',
        repo: 'momo',
        path: 'berthe/dugris.md',
        query: `?ref=master&client=${CONFIG.ghId}&secret=${CONFIG.ghSecret}`
      }
      expect(apiUrl.getApiUrl(params)).to.be.match(/^https/)
      expect(apiUrl.getApiUrl(params)).to.be.contain(params.owner)
      expect(apiUrl.getApiUrl(params)).to.be.contain(params.repo)
      expect(apiUrl.getApiUrl(params)).to.be.contain(params.path)
      expect(apiUrl.getApiUrl(params)).to.be.contain('&')
    })
    it('with short tree params, it return Url', () => {
      const params = {
        localDomain: 'https://api.daktary.com',
        owner: 'antonin',
        repo: 'momo',
        path: 'berthe',
        query: `?ref=master&client=${CONFIG.ghId}&secret=${CONFIG.ghSecret}`
      }
      const predict = /^https:\/\/api.daktary.com\/repos\/antonin\/momo\/contents\/berth/
      expect(apiUrl.getApiUrl(params)).to.be.match(predict)
    })
    it('with short tree params, it return Url', () => {
      const params = {
        localDomain: 'https://api.daktary.com',
        owner: 'antonin',
        repo: 'momo',
        path: 'berthe/arto',
        query: `?ref=master&client=${CONFIG.ghId}&secret=${CONFIG.ghSecret}`
      }
      const predict = '/repos/antonin/momo/contents/berthe/arto'
      expect(apiUrl.getApiUrl(params)).to.be.contain(predict)
    })
  })

  describe('Add token to increase github rate limit', () => {
    it('responds empty string when gh_secret or gh_id not present', () => {
      expect(apiUrl.addAuth(CONFIG.ghId, undefined)).to.be.equal('')
      expect(apiUrl.addAuth(undefined, CONFIG.ghSecret)).to.be.equal('')
    })
    it('responds correct string when gh_secret or gh_id are present', () => {
      expect(apiUrl.addAuth(CONFIG)).to.be.equal(
                '&client_id=964172a90e5c25e97616&client_secret=mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg=='
            )
    })
  })

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

  describe('Query', () => {
    it('start with default branch \'master\'', () => {
      expect(apiUrl.query()).to.match(/^\?ref=master/)
    })
    it('start with specify branch', () => {
      expect(apiUrl.query('gh-pages')).to.match(/^\?ref=gh-pages/)
    })
  })
})
