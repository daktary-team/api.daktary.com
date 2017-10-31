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
 * @return {Object} params - Github's params.
 */
const convertToGhParams = reqParams => {
  const ghParams = {
    owner: reqParams.owner,
    repo: reqParams.repo,
    branch: reqParams.branch
  }
  if (reqParams.path) {
    ghParams.path = `${reqParams.path}${reqParams[0]}`
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
const getGhRessources = (req, res) => {
  const ghUrl = ghApiUrl.toGhUrl(convertToGhParams(req.params))
  request(ghUrl)
    .then(rawJson => {
      const promises = addMetas(refine.mkdFilesFromTree(rawJson))
      Promise.all(promises).then(jsonFiles => {
        const jsonFolders = rawJson.filter(json => json.type === 'dir')
        res.json({
          name: convertToGhPath(req.params),
          url: ghUrl,
          type: 'tree',
          body: jsonFolders.concat(jsonFiles)
        })
      })
    })
    .catch(err => {
      res.json({
        path: convertToGhPath(req.params),
        url: ghUrl,
        type: '404',
        body: 'Uknown tree'
      })
    })
}

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
    repo_url: 'https://api.github.com/{owner}/{repo}/{branch}',
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
  const ghUrl = `https://api.github.com/users/${req.params.owner}/repos`
  request(ghUrl)
    .then(rawJson => {
      res.json({
        name: convertToGhPath(req.params),
        url: ghUrl,
        type: 'repos',
        body: rawJson
      })
    })
  .catch(err => {
    res.json({
      path: convertToGhPath(req.params),
      url: ghUrl,
      type: '404',
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
  getGhRessources(req, res)
})

/**
 * Return Github content for a folder
 * Convert:  https://api.daktary.com/:owner:/:repo:/tree/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path
 */
app.get('/:owner/:repo/tree/:branch/:path*', (req, res) => {
  getGhRessources(req, res)
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
      path: convertToGhPath(req.params),
      url: ghUrl,
      type: '404',
      body: 'Unknown extension'
    })
  }
  request(ghUrl)
    .then(ghBlob => {
      res.json(refine.ghMkd(ghBlob))
    })
    .catch(err => {
      res.json({
        path: convertToGhPath(req.params),
        url: ghUrl,
        type: '404',
        body: 'Uknown file'
      })
    })
})

app.get('*', (req, res) =>
  res.json({
    path: convertToGhPath(req.params),
    url: '',
    type: '404',
    body: 'Uknown route'
  })
)

app.listen(process.env.PORT)
