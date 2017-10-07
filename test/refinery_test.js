/* global describe, it */

const chai = require('chai')
const refine = require('../refinery')

const expect = chai.expect

describe('API -', () => {
  describe('Convert base64-markdown', () => {
    it('Transform base64-markdown in html', () => {
      const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
      expect(refine.decodeMkdBase64(content)).to.be.equal('<h1>Hello my love!</h1>\n')
    })
  })
})
