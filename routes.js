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

// TODO: verify which url I want html_url or url from refine.mkdFilesFromTree
const addMetas = (files) =>
files.filter(({ name, type }) =>
  refine.isMkdExt(name) && (type === 'file')
)
.map(({ url }) =>
  request(url).then(response =>
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
    repos_url: `${ghApiUrl.localDomain}/{owner}`,
    repo_url: `${ghApiUrl.localDomain}/{owner}/}repo:`,
    folder_url: `${ghApiUrl.localDomain}/{owner}/{repo}/tree/{branch}/{path}`,
    file_url: `${ghApiUrl.localDomain}/{owner}/{repo}/blob/{branch}/{path}`
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
    git_url: `${ghApiUrl.localDomain}/users/` +
      `${req.params.owner}/` +
      'repos' +
      `?ref=${req.params.branch}`
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
    git_url: `${ghApiUrl.localDomain}/repos/` +
      `${req.params.owner}/` +
      `${req.params.repo}` +
      `?ref=${req.params.branch}`
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
    localDomain: ghApiUrl.localDomain,
    owner: req.params.owner,
    repo: req.params.repo,
    path: `${req.params.path}${req.params[0]}`,
    branch: req.params.branch
  })
  request(gitUrl)
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
  if (!refine.isMkdExt(`${req.params[0]}`)) {
    throw new Error(
      `${req.params[0]}: not a valid file extension`)
  }
  const gitUrl = ghApiUrl.toGhUrl({
    localDomain: ghApiUrl.localDomain,
    owner: req.params.owner,
    repo: req.params.repo,
    path: `${req.params.path}${req.params[0]}`,
    branch: req.params.branch
  })
  request(gitUrl)
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
