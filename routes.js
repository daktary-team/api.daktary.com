const CONFIG = require('./config')
const app = require('express')()
const request = require('request-promise')
const md = require('markdown-it')()
const yaml = require('js-yaml')


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
apiUrl.getApiUrlDoc = ({ localDomain, owner, repo, filepath, query }) =>
    `${localDomain}/repos/` +
    `${owner}/` +
    `${repo}/` +
    'contents/' +
    filepath +
    query


/**
 * Return the filepath of url parameters.
 *
 * @param {Object} url params - Github url items.
 * @return {String} filepath - path and filename.
 */
apiUrl.getFilePath = params =>
    `${params.path}` + `${params[0]}`


/**
 * Check if file has valids extension.
 *
 * @param {String} filepath - path and filename.
 * @return {boolean} - is valid or not.
 */
apiUrl.isValidFileExt = filepath => {
    const validFileExt =
        /(.markdown||.mdown||.mkdn||.mkd||.md||asciidoc||.adoc||.asc)$/
    return filepath.match(validFileExt)[0] !== ''
}


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
            Accept: 'application/vnd.github.v3.json'
        },
        json: true
    }
    return request(options)
}


/**
 * Convert a markdown encode in base64 to html.
 *
 * @param {string} mdBase64 - markdown encode in base64.
 * @return {String} html - html content.
 */
const mdBase64ToHtml = content => md.render(
    Buffer.from(content, 'base64').toString('utf8')
)


/**
 * Get Github yaml metas from Github ressource.
 *
 * @param {string} mdBase64 - markdown encode in base64.
 * @return {String} metas - metas in yaml format.
 */
const metaFromMdBase64 = content => {
    try {
        return Buffer.from(content, 'base64')
            .toString('utf8')
            .match(/---\n([\s\S]*?)\n---/)[1]
    } catch (e) {
        return undefined
    }
}


/**
 * Add headers for API requests
 */
app.use(function(req, res, next) {
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
app.get('/:owner/:repo/blob/:branch/:path*', (req, res) => {
    if (!apiUrl.isValidFileExt(apiUrl.getFilePath(req.params))) {
        throw new Error(
            `${apiUrl.getFilePath(req.params)}: not a valid file extension`)
    }
    const gitUrl = apiUrl.getApiUrlDoc({
        localDomain: apiUrl.root,
        owner: req.params.owner,
        repo: req.params.repo,
        filepath: apiUrl.getFilePath(req.params),
        query: apiUrl.query(req.params.branch)
    })
    apiUrl.requestHtmlDoc(gitUrl)
        .then(body => {
            res.json({
                meta: yaml.load(metaFromMdBase64(body.content)),
                body: mdBase64ToHtml(body.content)
            })
        })
        .catch(err => {
            throw new Error(`Can't load: ${gitUrl} : ${err}`)
        })
})


app.listen(process.env.PORT)

module.exports = { apiUrl, mdBase64ToHtml, metaFromMdBase64 }
