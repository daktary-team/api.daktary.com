/*
  Refinery
  Post-processing of Github json files
*/

const yaml = require('js-yaml')
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
 * Check if file has valids markdown extension.
 *
 * @param {String} filepath - path and filename.
 * @return {boolean} - is valid or not.
 */
const isMkdExt = filepath =>
  filepath.match(/(.markdown||.mdown||.mkdn||.mkd||.md)$/)[0] !== ''

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
    return yaml.load(base64ToUtf8(base64Mkd).match(/---\n([\s\S]*?)\n---/)[1])
  } catch (e) {
    return undefined
  }
}

/**
 * Transform raw Github tree json to a collection of markdown files.
 *
 * @param {Object} githubTree - Github json tree.
 * @return {Object} jsonFiles - markdown collection files of Github tree.
 */
const mkdFilesFromTree = githubTree =>
  githubTree.filter(({ name, type }) => isMkdExt(name) || (type !== 'file'))
  .map(({ name, type, url }) => ({ name: name, type: type, url: url }))

module.exports = {
  base64ToUtf8,
  // public
  isMkdExt,
  decodeMkdBase64,
  metasFromMkdBase64,
  mkdFilesFromTree
}
