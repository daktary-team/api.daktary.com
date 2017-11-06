/* global describe, it */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const refine = require('../refinery')

const expect = chai.expect

describe('Refinery -', () => {
  describe('Convert base64 string', () => {
    it('to utf8', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      expect(refine.base64ToUtf8(content)).to.be.equal('# Hello my love!')
    })
  })

  describe('Remove metas from markdown content', () => {
    it('with meta', () => {
      const content = '---\ntitle: Vald\n---\n\n# Trop fait, trophée\n'
      expect(refine.removeMetas(content)).to.be.equal('\n# Trop fait, trophée\n')
    })
    it('without meta', () => {
      const content = 'Trop fait, trophée'
      expect(refine.removeMetas(content)).to.be.equal('Trop fait, trophée')
    })
  })

  describe('Check markdown extension', () => {
    it('.md', () => {
      expect(refine.isMkdExt('readme.md')).to.be.true
    })
    it('Check bad extension', () => {
      expect(refine.isMkdExt('readme.doc')).to.be.false
    })
  })

  describe('Extract content', () => {
    it('transform in html', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      expect(refine.contentFromMkdBase64(content)).to.be.equal('<h1>Hello my love!</h1>\n')
    })
    it('remove meta', () => {
      const content = 'LS0tCnRpdGxlOiBCb3VsZSB2aWVudCBpY2kgbW9uIGNoaWVuCmdyb3VwZTogcHRvc2UKLS0tCiMgVCdlcyBqb2xpIGNvbW1lIHBhaW4gZCdlcGljZQ=='
      expect(refine.contentFromMkdBase64(content)).to.be.equal('<h1>T\'es joli comme pain d\'epice</h1>\n')
    })
  })

  describe('Extract metas', () => {
    it('transform markdown-metas to json', () => {
      const content = 'LS0tCnRpdGxlOiBCb3VsZSB2aWVudCBpY2kgbW9uIGNoaWVuCmdyb3VwZTogcHTDtHNlCi0tLQ=='
      const json = refine.metasFromMkdBase64(content)
      expect(json.title).to.be.equal('Boule vient ici mon chien')
      expect(json.groupe).to.be.equal('ptôse')
    })
    it('return undefined when markdown-metas is empty', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      const undef = refine.metasFromMkdBase64(content)
      expect(undef).to.be.undefined
    })
  })

  describe('Refining a markdown Github document', () => {
    const mkdDoc = {
      name: 'README.md',
      path: 'README.md',
      sha: 'a3744f810321d6d56ee217b00cff16794d3f36b7',
      size: 775,
      url: 'https://api.github.com/repos/cpcoop/animer_ateliers/contents/README.md?ref=master',
      html_url: 'https://github.com/multibao/contributions/blob/master/contributions/d_sidd/ici_c_local.md',
      type: 'file',
      content: 'LS0tCnRpdGxlOiBCb3VsZSB2aWVudCBpY2kgbW9uIGNoaWVuCmdyb3VwZTogcHRvc2UKLS0tCiMgVCdlcyBqb2xpIGNvbW1lIHBhaW4gZCdlcGljZQ=='

    }
    it('it contains : url, name and type', () => {
      expect(refine.ghMkd(mkdDoc).name).to.be.equal('README.md')
      expect(refine.ghMkd(mkdDoc).url).to.be.equal('https://api.github.com/repos/cpcoop/animer_ateliers/contents/README.md?ref=master')
      expect(refine.ghMkd(mkdDoc).type).to.be.equal('file')
    })
    it('it contains : metas decrypted', () => {
      expect(refine.ghMkd(mkdDoc).meta.title).to.be.equal('Boule vient ici mon chien')
      expect(refine.ghMkd(mkdDoc).meta.groupe).to.be.equal('ptose')
    })
    it('it contains : body decrypted', () => {
      expect(refine.ghMkd(mkdDoc).body).to.be.equal('<h1>T\'es joli comme pain d\'epice</h1>\n')
    })
  })
})
