/*
  Github Api Urls
  Forge url for Github Api
*/

/**
 * To understand authentification rate limit policy, please read Github instructions :
 * > https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
 */
const authRateLimit = {
  ghSecret: process.env.GITHUB_SECRET,
  ghId: process.env.GITHUB_ID
}

/**
 * Configure the parameters for the api Github Url.
 */
const localDomain = 'https://api.github.com'

/**
 * Add token to url query to increase github rate limit
 *
 * @param {String} ghId default: authRateLimit.ghId   Github user id.
 * @param {String} ghSecret default: authRateLimit.ghSecret   Github secret token.
 * @return {String} url   url with query &client_id&client_secret.
 */
const addAuth = (url, { ghId, ghSecret } = authRateLimit) => {
  if (!(ghId && ghSecret) || !!url.match(/ghSecret=|ghId=/)) {
    return url
  }
  const querySymbol = url.match(/\?/) ? '&' : '?'
  return `${url}${querySymbol}client_id=${ghId}&client_secret=${ghSecret}`
}

/**
 * Create the url to extract document from Github.
 *
 * @param {Object} params - Github params - {localDomain, owner, repo, path, branch}
 * @return {String} github-url - The API Github Url.
 */
const toGhUrl = ({ localDomain, owner, repo, path, branch }) =>
  `${localDomain}/repos/` +
  `${owner}/` +
  `${repo}/` +
  'contents/' +
  path +
  `?ref=${branch}`

module.exports = {
  // public
  localDomain,
  addAuth,
  toGhUrl
}
