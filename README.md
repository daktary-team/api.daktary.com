# api.daktary.com

website : http://api.daktary.com

[![Build Status](https://travis-ci.org/daktary-team/api.daktary.com.svg?branch=master)](https://travis-ci.org/daktary-team/api.daktary.com)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation

### Github - Rate limit policies

For requests using Basic Authentication or OAuth, you can make up to 5,000 requests per hour.  
For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. - Github

Read Github instructions to understand the rate limit policies :  
[rate-limit-for-oauth-applications](https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications)

## Deploy on Heroku

Install: 
> https://devcenter.heroku.com/articles/heroku-cli

Start with creating an app

```bash
$ heroku login
$ heroku create
```

Now you can specify your token (cf. Github - Rate limit policies)

```bash
$ heroku config:get GITHUB_ID=xxxx
$ heroku config:get GITHUB_SECRET=yyyy
$ touch .env
$ heroku config:get GITHUB_ID -s  >> .env
$ heroku config:get GITHUB_SECRET -s  >> .env
```

### Start daktary-api locally

```bash
npm run start
```

Then [http://localhost:5000](http://localhost:5000)  
It runs with nodemon and foreman whose watch the modification to restart on change.

## Play Unit Tests

```bash
npm test
```

## Play Functional Tests

In test folder, you can get the autonomous page : *api_test_html*

You can open it in your favorite browser. It try to play with the local or distant API.

## Linter

```bash
npm run lint
```

## Spikes
- [cf. Generator](https://github.com/DrkSephy/es6-cheatsheet)
- supertest
- Restify vs express
- uglify
- README : https://codeburst.io/good-code-vs-bad-code-35624b4e91bc
- dist-src folders

## API Usage

### Load a Github document

In your console, you can try :

#### For a file
```JavaScript
fetch('http://localhost:5000/daktary-team/api.daktary.com/blob/master/README.md')
    .then(rep => rep.json())
    .then(json => console.log(json))
```

#### For a folder
```JavaScript
fetch('http://localhost:5000/daktary-team/api.daktary.com/tree/master/test')
    .then(rep => rep.json())
    .then(json => console.log(json))
```
