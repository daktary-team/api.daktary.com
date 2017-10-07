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

  describe('Interprete raw Github Json', () => {
    it('Verify fields', () => {
      const rawJson = [{
        name: 'README.md',
        path: 'README.md',
        sha: 'b9c88f5d1991cea6c613cdce83487d6ed3ca2ab9',
        size: 2285,
        url: 'https://api.github.com/repos/multibao/organisations/contents/README.md?ref=master',
        html_url: 'https://github.com/multibao/organisations/blob/master/README.md',
        git_url: 'https://api.github.com/repos/multibao/organisations/git/blobs/b9c88f5d1991cea6c613cdce83487d6ed3ca2ab9',
        download_url: 'https://raw.githubusercontent.com/multibao/organisations/master/README.md',
        type: 'file',
        _links: {
          self: 'https://api.github.com/repos/multibao/organisations/contents/README.md?ref=master',
          git: 'https://api.github.com/repos/multibao/organisations/git/blobs/b9c88f5d1991cea6c613cdce83487d6ed3ca2ab9',
          html: 'https://github.com/multibao/organisations/blob/master/README.md'
        }
      }]
      expect(apiUrl.jsonFiles(rawJson)[0]).to.haveOwnProperty('name')
      expect(apiUrl.jsonFiles(rawJson)[0].type).to.be.equal('file')
    })
    it('Only Markdown', () => {
      const files = [
                { name: 'README.md', type: 'file' },
                { name: 'README.adoc', type: 'file' },
                { name: 'vendor', type: 'folder' },
                { name: 'README.txt', type: 'file' }
      ]
      expect(apiUrl.jsonFiles(files)).to.be.length(2)
    })
  })

  describe('Convert metas', () => {
    it('Transform markdown-metas to json', () => {
      const yaml = require('js-yaml')
      const content = 'LS0tCnRpdGxlOiBCb3VsZSB2aWVudCBpY2kgbW9uIGNoaWVuCmdyb3VwZTogcHTDtHNlCi0tLQ=='
      const json = yaml.load(routes.metaFromMdBase64(content))
      expect(json.title).to.be.equal('Boule vient ici mon chien')
      expect(json.groupe).to.be.equal('ptôse')
    })
    it('Return undefined when none markdown-metas', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      const undef = routes.metaFromMdBase64(content)
      expect(undef).to.be.undefined
    })
  })
})
