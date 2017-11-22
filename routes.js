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
const addFilesMetas = files =>
  files.map(({ url }) =>
    request(url).then(ghBlob => refine.ghMkd(ghBlob))
  )

/**
 * Convert express url params to github params.
 *
 * @param {Object} expressParams - req.params of express.
 * @return {Object} params - Github's params.
 */
const convertToGhParams = reqParams => {
  const ghParams = {
    owner: reqParams.owner,
    repo: reqParams.repo,
    branch: reqParams.branch,
    path: `${reqParams.path || ''}${reqParams[0] || ''}`
  }
  return ghParams
}

/**
 * Convert express url params to github path.
 *
 * @param {Object} expressParams - req.params of express.
 * @return {Object} params - Github's path.
 */
const convertToGhPath = reqParams => {
  const ghParams = convertToGhParams(reqParams)
  const path =
    `${ghParams.owner ? ghParams.owner + '/' : ''}` +
    `${ghParams.repo ? ghParams.repo + '/' : ''}` +
    `${ghParams.branch ? ghParams.branch + '/' : ''}` +
    `${ghParams.path || ''}`
  return path.replace(/\/$/, '')
}

/**
 * Get files and folders from Github.
 *
 * @param {Object} req - req.params of express.
 * @param {Object} res - res.params of express.
 */
const getTree = (req, res) =>
  new Promise((resolve, reject) => {
    const ghUrl = ghApiUrl.toGhUrl(convertToGhParams(req.params))
    request(ghUrl).then(rawJson => {
      const folders = rawJson.filter(json => json.type === 'dir').map(folder => refine.ghFolder(folder))
      const files = rawJson.filter(({ name, type }) => refine.isMkdExt(name) && type === 'file')
      const promises = addFilesMetas(files)
      Promise.all(promises)
        .then(filesWithMetas => (
          resolve({
            full_name: convertToGhPath(req.params),
            url: ghUrl,
            type: 'tree',
            body: folders.concat(filesWithMetas)
          })
        ))
    })
    .catch(err => (
      resolve({
        full_name: convertToGhPath(req.params),
        url: ghUrl,
        type: '404',
        err: err,
        body: 'Uknown tree'
      })
    ))
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
    repos_url: 'https://api.daktary.com/{owner}',
    repo_url: 'https://api.daktary.com/{owner}/{repo}/{branch}',
    folder_url: 'https://api.daktary.com/{owner}/{repo}/tree/{branch}/{path}',
    file_url: 'https://api.daktary.com/{owner}/{repo}/blob/{branch}/{path}'
  }
  res.json(routes)
})

/**
 * Return Github content for a repositories
 * Convert: https://api.daktary.com/:owner:/
 * to github api: https://api.github.com/repos/:owner:
 */
app.get('/:owner', (req, res) => {
  const ghUrl = `https://api.github.com/users/${req.params.owner}/repos`
  request(ghUrl)
    .then(rawJson => {
      const repos = rawJson.map(repo => {
        repo.type = 'repo'
        repo.full_name += '/master'
        return repo
      })
      res.json({
        full_name: convertToGhPath(req.params),
        breadcrumb: [],
        url: ghUrl,
        type: 'tree',
        body: repos
      })
    })
  .catch(err => {
    res.json({
      full_name: convertToGhPath(req.params),
      breadcrumb: [],
      url: ghUrl,
      type: '404',
      err: err,
      body: 'Uknown user'
    })
  })
})

/**
 * Return Github content for a repository
 * Convert: https://api.daktary.com/:owner:/:repo:
 * to github api: https://api.github.com/repos/:owner:/:repo:
 */
app.get('/:owner/:repo/:branch', (req, res) => {
  getTree(req, res)
    .then(tree => {
      tree.breadcrumb = refine.breadcrumbOwner(req.params)
      res.json(tree)
    })
    .catch(err => res.json(err))
})

/**
 * Return Github content for a folder
 * Convert:  https://api.daktary.com/:owner:/:repo:/tree/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path
 */
app.get('/:owner/:repo/tree/:branch/:path*', (req, res) => {
  getTree(req, res)
    .then(tree => {
      tree.breadcrumb = refine.breadcrumbRepo(req.params)
      res.json(tree)
    })
    .catch(err => res.json(err))
})

/**
 * Return Github content for a file
 * Convert: https://api.daktary.com/:owner:/:repo:/blob/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path:
 */
app.get('/:owner/:repo/blob/:branch/:path*', (req, res) => {
  const ghUrl = ghApiUrl.toGhUrl(convertToGhParams(req.params))
  const fileName = req.params[0] || req.params.path
  if (!refine.isMkdExt(fileName)) {
    res.json({
      full_name: convertToGhPath(req.params),
      breadcrumb: [],
      url: ghUrl,
      type: '404',
      body: 'Unknown extension'
    })
  }
  request(ghUrl)
    .then(ghBlob => {
      const blob = refine.ghMkd(ghBlob)
      blob.breadcrumb =
        req.params[0] ? refine.breadcrumbTree(req.params) : refine.breadcrumbRepo(req.params)
      res.json(blob)
    })
    .catch(err => {
      res.json({
        full_name: convertToGhPath(req.params),
        breadcrumb: [],
        url: ghUrl,
        type: '404',
        err: err,
        body: 'Uknown file'
      })
    })
})

app.get('*', (req, res) =>
  res.json({
    full_name: convertToGhPath(req.params),
    breadcrumb: [],
    url: '',
    type: '404',
    body: 'Uknown route'
  })
)

app.listen(process.env.PORT)
