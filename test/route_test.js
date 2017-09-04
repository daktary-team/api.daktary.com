/* eslint-disable max-len */

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
        it('With right parameters it return Url', () => {
            const params = {
                localDomain: 'https://api.daktary.com',
                owner: 'Antonin',
                repo: 'momo',
                filename: 'berthe/dugris.md',
                query: '?ref=master&secret=terces'
            }
            const query = `&ref=master&client=${CONFIG.ghId}&secret=${CONFIG.ghSecret}`
            expect(apiUrl.getApiUrlDoc(params)).to.be.match(/^https/)
            expect(apiUrl.getApiUrlDoc(params)).to.be.contain(params.owner)
            expect(apiUrl.getApiUrlDoc(params)).to.be.contain(params.repo)
            expect(apiUrl.getApiUrlDoc(params)).to.be.contain(params.path)
            expect(apiUrl.getApiUrlDoc(params)).to.be.contain('&')
        })
    })


    describe('Add token to increase github rate limit', () => {
        it('Respond empty string when gh_secret or gh_id not present', () => {
            expect(apiUrl.addAuth(CONFIG.ghId, undefined)).to.be.equal('')
            expect(apiUrl.addAuth(undefined, CONFIG.ghSecret)).to.be.equal('')
        })
        it('Respond correct string when gh_secret or gh_id are present', () => {
            expect(apiUrl.addAuth(CONFIG.ghId, CONFIG.ghSecret)).to.be.equal(
                '&client_id=964172a90e5c25e97616&client_secret=mUW1ZmRkZGGjOTZlVGM2ZTc1nMI4NjRjYTI3Y2RxZGYyNzdmZTdkZg=='
            )
        })
    })


    describe('Get filepath with params', () => {
        it('Get filepath with file and path', () => {
            const params = {
                path: 'berthe/',
                0: 'dugris.md'
            }
            expect(apiUrl.getFilePath(params)).to.be.equal('berthe/dugris.md')
        })
        it('Get filepath without path', () => {
            const params = {
                path: 'README.md',
                0: ''
            }
            expect(apiUrl.getFilePath(params)).to.be.equal('README.md')
        })
    })


    describe('Check filename extension', () => {
        it('Check .md extension', () => {
            expect(apiUrl.isValidFileExt('readme.md')).to.be.true
        })
        it('Check .adoc extension', () => {
            expect(apiUrl.isValidFileExt('readme.adoc')).to.be.true
        })
        it('Check bad extension', () => {
            expect(apiUrl.isValidFileExt('readme.doc')).to.be.false
        })
    })


    describe('Add query', () => {
        it('Query start with default branch \'master\'', () => {
            expect(apiUrl.query()).to.match(/^\?ref=master/)
        })
        it('Query start with specify branch', () => {
            expect(apiUrl.query('gh-pages')).to.match(/^\?ref=gh-pages/)
        })
        it('Query add token', () => {
            expect(apiUrl.query('undefined', CONFIG)).to.contains('&client_id=')
            expect(apiUrl.query('undefined', CONFIG)).to.contains('&client_secret=')
        })
    })


    describe('Convert base64-markdown', () => {
        it('Transform base64-markdown in html', () => {
            const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
            expect(routes.mdBase64ToHtml(content)).to.be.equal('<h1>Hello my love!</h1>\n')
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
            const yaml = require('js-yaml')
            const content = 'IyBIZWxsbyBteSBsb3ZlIQ=='
            const undef = routes.metaFromMdBase64(content)
            expect(undef).to.be.undefined
        })
    })
})
