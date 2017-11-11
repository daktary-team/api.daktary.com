/*
  Refinery
  Post-processing of Github json files
*/

const yaml = require('js-yaml')
const mkd = require('markdown-it')({ html: true })

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
 * Remove metas.
 *
 * @param {string} mkd - mkd content.
 * @return {String} mkd - mkd without meta.
 */
const removeMetas = mkd => {
  try {
    return mkd.match(/---\n[\s\S]*?\n---\n([\s\S]*)/)[1]
  } catch (e) {
    return mkd
  }
}

/**
 * Convert a base64 markdown in html.
 *
 * @param {string} base64Mkd - string encode in base64.
 * @return {String} utf8 - utf8 content.
 */
const contentFromMkdBase64 = base64Mkd => mkd.render(removeMetas(base64ToUtf8(base64Mkd)))

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
 * Refine raw Github json file.
 *
 * @param {Object} ghMkdFile - Github json file.
 * @return {Object} jsonFile - markdown file refined.
 */
const ghMkd = ghMkdFile =>
  ({
    name: ghMkdFile.name,
    url: ghMkdFile.url,
    type: ghMkdFile.type,
    meta: metasFromMkdBase64(ghMkdFile.content),
    body: contentFromMkdBase64(ghMkdFile.content),
    full_name: ghMkdFile.html_url.replace('https://github.com/', '')
  })

/**
 * Refine raw Github json folder.
 *
 * @param {Object} ghMkdFolder - Github json folder.
 * @return {Object} jsonFolder - folder refined.
 */
const ghFolder = ghFolder =>
({
  name: ghFolder.name,
  url: ghFolder.url,
  type: ghFolder.type,
  full_name: ghFolder.html_url.replace('https://github.com/', '')
})

/**
 * Breadcrumb data for user.
 *
 * @param {String} filepath - path and filename.
 * @return {boolean} - is valid or not.
 */
const breadcrumbOwner = path =>
  ([{ link: path.owner, title: path.owner }])

/**
 * Breadcrumb data for repo.
 *
 * @param {String} filepath - path and filename.
 * @return {boolean} - is valid or not.
 */
const breadcrumbRepo = path =>
  breadcrumbOwner(path).concat([
    { link: `${path.owner}/${path.repo}/${path.branch}`, title: path.repo }
  ])

/**
 * Breadcrumb data for tree.
 *
 * @param {String} filepath - path and filename.
 * @return {boolean} - is valid or not.
 */
const breadcrumbTree = path => 
  breadcrumbRepo(path).concat([
    { link: `${path.owner}/${path.repo}/tree/${path.branch}/${path.path}`, title: path.path }
  ])

module.exports = {
  base64ToUtf8,
  removeMetas,
  contentFromMkdBase64,
  metasFromMkdBase64,
  // public
  isMkdExt,
  ghMkd,
  ghFolder,
  breadcrumbOwner,
  breadcrumbRepo,
  breadcrumbTree
}
