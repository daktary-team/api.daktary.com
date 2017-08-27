const express = require('express')
const app = express()
const https = require('https')
const CONFIG = require('./config')


/*
 * Configure the parameters for the api Github Url
 */
const apiUrl = {}
apiUrl.root = 'https://api.github.com'


/**
 * Create query for api url
 * @param {String} branch   branch's name.
 * @return {String} query   query string with ref=branch&client_id&client_secret.
 */
apiUrl.query = (branch = 'master', { ghId, ghSecret } = CONFIG) => {
    return `?ref=${branch}${apiUrl.addAuth(ghId, ghSecret)}`
}


/**
 * Add token to query to increase github rate limit
 * @param {String} ghId   Github user id.
 * @param {String} ghSecret   Github secret token.
 * @return {String} query   query string with &client_id&client_secret.
 */
apiUrl.addAuth = (ghId, ghSecret) => {
    if (ghId && ghSecret) {
        return `&client_id=${ghId}&client_secret=${ghSecret}`
    } else {
        return ''
    }
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
    res.send(routes)
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
            `repos` +
            apiUrl.query()
    }
    res.send(routes)
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
    res.send(routes)
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
            `contents/` +
            `${req.params.path}` +
            apiUrl.query(req.params.branch)
    }
    res.send(routes)
})


/** 
 * Return Github content for a file
 * Convert: https://api.daktary.com/:owner:/:repo:/blob/:branch:/:path:
 * to github api: https://api.github.com/repos/:owner:/:repo:/contents/:path:
 */
app.get('/:owner/:repo/blob/:branch/:path', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const routes = {
        git_url: `${apiUrl.root}/repos/` +
            `${req.params.owner}/` +
            `${req.params.repo}/` +
            `contents/` +
            `${req.params.path}` +
            apiUrl.query(req.params.branch)
    }
    res.send(routes)
})


app.listen(process.env.PORT)


module.exports = apiUrl