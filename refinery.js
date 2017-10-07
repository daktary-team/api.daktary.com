/*
  Refinery
  Post-processing of Github json files
*/

const mkd = require('markdown-it')()

/**
 * Convert a base64 markdown in html.
 *
 * @param {string} base64Mkd - string encode in base64.
 * @return {String} utf8 - utf8 content.
 */
const decodeMkdBase64 = base64Mkd => mkd.render(
    Buffer.from(base64Mkd, 'base64').toString('utf8')
)

module.exports = { decodeMkdBase64 }
