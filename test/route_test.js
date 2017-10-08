/* global describe, it */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const routes = require('../routes')
const apiUrl = routes.apiUrl

const expect = chai.expect

describe('API -', () => {
  describe('Check filename extension', () => {
    it('Check .md extension', () => {
      expect(apiUrl.isValidFileExt('readme.md')).to.be.true
    })
    it('Check bad extension', () => {
      expect(apiUrl.isValidFileExt('readme.doc')).to.be.false
    })
  })
})
