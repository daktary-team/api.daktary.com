'use strict'

const express = require('express')
const app = express()
const https = require('https')
const port = process.env.PORT || 8001

app.get('/', (req, res) => {
    const routes = {
        repos_url: 'https://api.github.com/{user}'
    }
    res.header('Access-Control-Allow-Origin', '*')

    res.send(routes)
})

app.listen(port)
