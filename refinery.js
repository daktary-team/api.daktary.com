/*
  Refinery
  Post-processing of Github json files
*/

const mkd = require('markdown-it')()


/**
 * Convert a base64 in utf8.
 *
 * @param {string} base64 - string encode in base64.
 * @return {String} utf8 - utf8 content.
 */
const base64ToUtf8 = base64 =>
  Buffer.from(base64, 'base64').toString('utf8')

/**
 * Convert a base64 markdown in html.
 *
 * @param {string} base64Mkd - string encode in base64.
 * @return {String} utf8 - utf8 content.
 */
const decodeMkdBase64 = base64Mkd => mkd.render(base64ToUtf8(base64Mkd))

/**
 * Get Github yaml metas from Github ressource.
 *
 * @param {string} mdBase64 - markdown encode in base64.
 * @return {String} metas - metas in yaml format.
 */
const metasFromMkdBase64 = base64Mkd => {
  try {
    return base64ToUtf8(base64Mkd).match(/---\n([\s\S]*?)\n---/)[1]
  } catch (e) {
    return undefined
  }
}

module.exports = {
  base64ToUtf8,
  // public
  decodeMkdBase64,
  metasFromMkdBase64
}
