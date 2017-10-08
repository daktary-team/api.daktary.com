const app = require('express')()
const request = require('request-promise')

const ghApiUrl = require('./gh-api-url')
const refine = require('./refinery')

/**
 * Configure the parameters for the api Github Url.
 */
const apiUrl = {}
apiUrl.root = 'https://api.github.com'

/**
 * Return the filepath of url parameters.
 *
 * @param {Object} url params - Github url items.
 * @return {String} filepath - path and filename.
 */
apiUrl.getPath = params =>
  `${params.path}` + `${params[0]}`

/**
 * Check if file has valids extension.
 *
 * @param {String} filepath - path and filename.
 * @return {boolean} - is valid or not.
 */
apiUrl.isValidFileExt = filepath => {
  const validFileExt =
    /(.markdown||.mdown||.mkdn||.mkd||.md)$/
  return filepath.match(validFileExt)[0] !== ''
}

/**
 * Get an html ressource from Github
 *
 * @param {String} url - Github url query.
 * @return {Object} request - request to load.
 */
apiUrl.request = url => {
  const options = {
    url: `${ghApiUrl.addAuth(url)}`,
    headers: {
      'User-Agent': 'daktary',
      Accept: 'application/vnd.github.v3.json'
    },
    json: true
  }
  return request(options)
}

// TODO: verify which url I want html_url or url from refine.mkdFilesFromTree
const addMetas = (files) =>
files.filter(({ name, type }) =>
  apiUrl.isValidFileExt(name) && (type === 'file')
)
.map(({ url }) =>
  apiUrl.request(url).then(response =>
    ({
      url: response.url,
      name: response.name,
      type: response.type,
      meta: refine.metasFromMkdBase64(response.content),
      body: refine.decodeMkdBase64(response.content)
    })
  )
)

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
    repos_url: `${apiUrl.root}/{owner}`,
    repo_url: `${apiUrl.root}/{owner}/}repo:`,
    folder_url: `${apiUrl.root}/{owner}/{repo}/tree/{branch}/{path}`,
    file_url: `${apiUrl.root}/{owner}/{repo}/blob/{branch}/{path}`
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
    git_url: `${apiUrl.root}/users/` +
      `${req.params.owner}/` +
      'repos' +
      `?ref=${branch}`
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
    git_url: `${apiUrl.root}/repos/` +
      `${req.params.owner}/` +
      `${req.params.repo}` +
      `?ref=${branch}`
  }
  res.json(routes)
})

/**
 * Return Github content for a folder
 * Convert:  https://api.daktary.com/:owner:/:repo:/tree/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path
 */
app.get('/:owner/:repo/tree/:branch/:path*', (req, res) => {
  const gitUrl = ghApiUrl.toGhUrl({
    localDomain: apiUrl.root,
    owner: req.params.owner,
    repo: req.params.repo,
    path: apiUrl.getPath(req.params),
    branch: req.params.branch
  })
  apiUrl.request(gitUrl)
    .then(rawJson => {
      const promises = addMetas(refine.mkdFilesFromTree(rawJson))
      Promise.all(promises).then(results => {
        res.json(results)
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
  if (!apiUrl.isValidFileExt(apiUrl.getPath(req.params))) {
    throw new Error(
      `${apiUrl.getPath(req.params)}: not a valid file extension`)
  }
  const gitUrl = ghApiUrl.toGhUrl({
    localDomain: apiUrl.root,
    owner: req.params.owner,
    repo: req.params.repo,
    path: apiUrl.getPath(req.params),
    branch: req.params.branch
  })
  apiUrl.request(gitUrl)
    .then(body => {
      res.json({
        meta: refine.metasFromMkdBase64(body.content),
        body: refine.decodeMkdBase64(body.content)
      })
    })
    .catch(err => {
      throw new Error(`Can't load: ${gitUrl} : ${err}`)
    })
})

app.listen(process.env.PORT)

module.exports = {
  apiUrl
}
