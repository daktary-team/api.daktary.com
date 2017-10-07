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

/**
 * Get Github yaml metas from Github ressource.
 *
 * @param {string} mdBase64 - markdown encode in base64.
 * @return {String} metas - metas in yaml format.
 */
const metasFromMkdBase64 = base64Mkd => {
  try {
    return Buffer.from(base64Mkd, 'base64')
      .toString('utf8')
      .match(/---\n([\s\S]*?)\n---/)[1]
  } catch (e) {
    return undefined
  }
}

module.exports = { decodeMkdBase64, metasFromMkdBase64 }
