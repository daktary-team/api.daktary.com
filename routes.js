const express = require('express')
const app = express()
const https = require('https')
const config = require('./config')


/*
 * Configure the parameters for the api Github Url
 */
const apiUrl = {}
apiUrl.root = 'https://api.github.com'

/**
 * Create query for api url
 * @param {Object} config   config data.
 * @return {String} query   query string with ref=branch&client_id&client_secret.
 */
apiUrl.query = (cfg) =>
    '?ref=master' + apiUrl.addAuth(this.query, cfg)

/**
 * Create query complement to Github authorization
 * @param {Object} config   config data {ghId, ghSecret}.
 * @return {String} query   query string with &client_id&client_secret.
 */
apiUrl.addAuth = (query, { ghId, ghSecret }) => {
    if (typeof ghId !== 'undefined' && typeof ghSecret !== 'undefined') {
        return `&client_id=${ghId}&client_secret=${ghSecret}`
    } else {
        return ''
    }
}

app.get('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const routes = {
        repos_url: `${apiUrl.root}/{owner}`
    }
    res.send(routes)
})

app.get('/:owner/:repo', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const routes = {
        git_url: `${apiUrl.root}/repos/` +
            `${req.params.owner}/` +
            `${req.params.repo}` +
            apiUrl.query(config)
    }
    res.send(routes)
})

app.listen(process.env.PORT)