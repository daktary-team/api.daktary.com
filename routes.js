const express = require('express')
const app = express()
const request = require('request-promise')
const CONFIG = require('./config')


/**
 * Configure the parameters for the api Github Url.
 */
const apiUrl = {}
apiUrl.root = 'https://api.github.com'


/**
 * Create query for api url.
 *
 * @param {string} branch - branch's name.
 * @return {String} query - query string with ref=branch&client_id&client_secret.
 */
apiUrl.query = (branch = 'master', { ghId, ghSecret } = CONFIG) => {
    return `?ref=${branch}${apiUrl.addAuth(ghId, ghSecret)}`
}


/**
 * Add token to query to increase github rate limit
 *
 * @param {String} ghId   Github user id.
 * @param {String} ghSecret   Github secret token.
 * @return {String} query   query string with &client_id&client_secret.
 */
apiUrl.addAuth = (ghId, ghSecret) => {
    if (ghId && ghSecret) {
        return `&client_id=${ghId}&client_secret=${ghSecret}`
    }
    return ''
}


/**
 * Create the url to extract document from Github.
 *
 * @param {String} localDomain - The base Url to exchange with Github API.
 * @param {Object} params - Github params - {owner, repo, path}
 * @param {String} query - Github params for queries Url.
 * @return {String} github-url - The API Github Url.
 */
apiUrl.getApiUrlDoc = (localDomain, params, query) =>
    `${localDomain}/repos/` +
    `${params.owner}/` +
    `${params.repo}/` +
    'contents/' +
    `${params.path}` +
    query


/**
 * Get an html ressource from Github
 *
 * @param {String} url - Github url query.
 * @return {Object} request - request to load.
 */
apiUrl.requestHtmlDoc = url => {
    const options = {
        url: url,
        headers: {
            'User-Agent': 'daktary',
            'Accept': 'application/vnd.github.v3.html'
        }
    }
    return request(options)
}


/**
 * Display api's options for the root route
 */
app.get('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
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
    res.header('Access-Control-Allow-Origin', '*')
    const routes = {
        git_url: `${apiUrl.root}/users/` +
            `${req.params.owner}/` +
            'repos' +
            apiUrl.query()
    }
    res.json(routes)
})


/**
 * Return Github content for a repository
 * Convert: https://api.daktary.com/:owner:/:repo:
 * to github api: https://api.github.com/repos/:owner:/:repo:
 */
app.get('/:owner/:repo', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const routes = {
        git_url: `${apiUrl.root}/repos/` +
            `${req.params.owner}/` +
            `${req.params.repo}` +
            apiUrl.query()
    }
    res.json(routes)
})


/**
 * Return Github content for a folder
 * Convert:  https://api.daktary.com/:owner:/:repo:/tree/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path
 */
app.get('/:owner/:repo/tree/:branch/:path', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const routes = {
        git_url: `${apiUrl.root}/repos/` +
            `${req.params.owner}/` +
            `${req.params.repo}/` +
            'contents/' +
            `${req.params.path}` +
            apiUrl.query(req.params.branch)
    }
    res.json(routes)
})


/**
 * Return Github content for a file
 * Convert: https://api.daktary.com/:owner:/:repo:/blob/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path:
 */
app.get('/:owner/:repo/blob/:branch/:path', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const gitUrl = apiUrl.getApiUrlDoc(
        apiUrl.root, req.params, apiUrl.query(req.params.branch)
    )
    apiUrl.requestHtmlDoc(gitUrl)
        .then(body => {
            res.json({ body: body })
        })
        .catch(err => {
            throw `Can't load Github document : ${err}`
        })
})


app.listen(process.env.PORT)

module.exports = apiUrl
