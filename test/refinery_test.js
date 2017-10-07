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

  describe('Convert base64-markdown', () => {
    it('transform in html', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      expect(refine.decodeMkdBase64(content)).to.be.equal('<h1>Hello my love!</h1>\n')
    })
  })

  describe('Extract metas', () => {
    it('transform markdown-metas to json', () => {
      const yaml = require('js-yaml')
      const content = 'LS0tCnRpdGxlOiBCb3VsZSB2aWVudCBpY2kgbW9uIGNoaWVuCmdyb3VwZTogcHTDtHNlCi0tLQ=='
      const json = yaml.load(refine.metasFromMkdBase64(content))
      expect(json.title).to.be.equal('Boule vient ici mon chien')
      expect(json.groupe).to.be.equal('ptôse')
    })
    it('return undefined when markdown-metas is empty', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      const undef = refine.metasFromMkdBase64(content)
      expect(undef).to.be.undefined
    })
  })
})
