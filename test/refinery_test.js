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

  describe('Check markdown extension', () => {
    it('.md', () => {
      expect(refine.isMkdExt('readme.md')).to.be.true
    })
    it('Check bad extension', () => {
      expect(refine.isMkdExt('readme.doc')).to.be.false
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

  describe('Extract files from github tree', () => {
    it('Verify fields', () => {
      const tree = [{
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
      expect(refine.mkdFilesFromTree(tree)[0]).to.haveOwnProperty('name')
      expect(refine.mkdFilesFromTree(tree)[0].type).to.be.equal('file')
    })
    it('Only Markdown and folder', () => {
      const tree = [
        { name: 'README.md', type: 'file', url: 'https://api.github.com/repos/foo/bar/contents/README.md?ref=master' },
        { name: 'README.adoc', type: 'file', url: 'https://api.github.com/repos/foo/bar/contents/README.adoc?ref=master' },
        { name: 'vendor', type: 'dir', url: 'https://api.github.com/repos/foo/bar/contents/vendor?ref=master' },
        { name: 'README.txt', type: 'file', url: 'https://api.github.com/repos/foo/bar/contents/README.txt?ref=master' }
      ]
      expect(refine.mkdFilesFromTree(tree)).to.be.length(2)
    })
  })
})
