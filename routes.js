const app = require('express')()
const requestPromise = require('request-promise')

const ghApiUrl = require('./gh-api-url')
const refine = require('./refinery')

/**
 * Get an html ressource from Github
 *
 * @param {String} url - Github url query.
 * @return {Object} request - request to load.
 */
const request = url => {
  const options = {
    url: `${ghApiUrl.addAuth(url)}`,
    headers: {
      'User-Agent': 'daktary',
      Accept: 'application/vnd.github.v3.json'
    },
    json: true
  }
  return requestPromise(options)
}

/**
 * Add metas for each files from json collections.
 *
 * @param {Array} files - Files collection.
 * @return {Array} files - Files collection with metas.
 */
const addMetas = files =>
  files.filter(({ name, type }) =>
    refine.isMkdExt(name) && type === 'file'
  )
  .map(({ url }) =>
    request(url).then(ghBlob => refine.ghMkd(ghBlob))
  )

/**
 * Convert express url params to github params.
 *
 * @param {Object} expressParams - req.params of express.
 * @return {Object} request - request to load.
 */
const convertToGhParams = reqParams =>
  ({
    owner: reqParams.owner,
    repo: reqParams.repo,
    path: `${reqParams.path}${reqParams[0]}`,
    branch: reqParams.branch
  })

/**
 * Add headers for API requests
 */
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

/**
 * Display api's options for the root route
 */
app.get('/', (req, res) => {
  const routes = {
    repos_url: 'https://api.github.com/{owner}',
    repo_url: 'https://api.github.com/{owner}/{repo}',
    folder_url: 'https://api.github.com/{owner}/{repo}/tree/{branch}/{path}',
    file_url: 'https://api.github.com/{owner}/{repo}/blob/{branch}/{path}'
  }
  res.json(routes)
})

/**
 * Return Github content for a repositories
 * Convert: https://api.daktary.com/:owner:/
 * to github api: https://api.github.com/repos/:owner:
 */
app.get('/:owner', (req, res) => {
  const routes = {
    git_url:
      `https://api.github.com/users/${req.params.owner}/repos?ref=${req.params.branch}`
  }
  res.json(routes)
})

/**
 * Return Github content for a repository
 * Convert: https://api.daktary.com/:owner:/:repo:
 * to github api: https://api.github.com/repos/:owner:/:repo:
 */
app.get('/:owner/:repo', (req, res) => {
  const routes = {
    git_url:
      `https://api.github.com/repos/${req.params.owner}/${req.params.repo}?ref=${req.params.branch}`
  }
  res.json(routes)
})

/**
 * Return Github content for a folder
 * Convert:  https://api.daktary.com/:owner:/:repo:/tree/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path
 */
app.get('/:owner/:repo/tree/:branch/:path*', (req, res) => {
  const gitUrl = ghApiUrl.toGhUrl(convertToGhParams(req.params))
  request(gitUrl)
    .then(rawJson => {
      const promises = addMetas(refine.mkdFilesFromTree(rawJson))
      Promise.all(promises).then(jsonFiles => {
        const jsonFolders = rawJson.filter(json => json.type === 'dir')
        res.json(jsonFolders.concat(jsonFiles))
      })
    })
    .catch(err => {
      throw new Error(`Can't load: ${gitUrl} : ${err}`)
    })
})

/**
 * Return Github content for a file
 * Convert: https://api.daktary.com/:owner:/:repo:/blob/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path:
 */
app.get('/:owner/:repo/blob/:branch/:path*', (req, res) => {
  const fileName = req.params[0] || req.params.path
  if (!refine.isMkdExt(fileName)) {
    throw new Error(
      `${fileName}: not a valid markdown file extension`)
  }
  const gitUrl = ghApiUrl.toGhUrl(convertToGhParams(req.params))
  request(gitUrl)
    .then(ghBlob => {
      res.json(refine.ghMkd(ghBlob))
    })
    .catch(err => {
      throw new Error(`Can't load: ${gitUrl} : ${err}`)
    })
})

app.listen(process.env.PORT)
